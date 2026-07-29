(() => {
  'use strict';

  const Interface = {};

  Interface.copyText = async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    if (!copied) throw new Error('Clipboard copy failed');
    return true;
  };

  Interface.openPromptDialog = function openPromptDialog({ title = 'Попередній перегляд запиту', prompt = '', invoker = null, status = null } = {}) {
    let dialog = document.getElementById('ucan-prompt-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'ucan-prompt-dialog';
      dialog.className = 'ucan-prompt-dialog';
      dialog.setAttribute('aria-labelledby', 'ucan-prompt-dialog-title');
      dialog.innerHTML = `
        <div class="ucan-dialog-card">
          <div class="ucan-dialog-header">
            <h2 id="ucan-prompt-dialog-title"><span aria-hidden="true">👁️</span> <span class="ucan-dialog-title">Попередній перегляд запиту</span></h2>
            <button class="button button-secondary button-small" id="ucan-prompt-dialog-close" type="button">Закрити</button>
          </div>
          <pre class="ucan-prompt-content" id="ucan-prompt-dialog-content" tabindex="0"></pre>
          <div class="button-row">
            <button class="button button-primary" id="ucan-prompt-dialog-copy" type="button"><span aria-hidden="true">📋</span> <span>Скопіювати запит</span></button>
          </div>
        </div>`;
      document.body.appendChild(dialog);
    }
    dialog.querySelector('.ucan-dialog-title').textContent = title;
    dialog.querySelector('#ucan-prompt-dialog-content').textContent = prompt;
    const closeButton = dialog.querySelector('#ucan-prompt-dialog-close');
    const copyButton = dialog.querySelector('#ucan-prompt-dialog-copy');
    const close = () => {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    };
    closeButton.onclick = close;
    copyButton.onclick = async () => {
      try {
        await Interface.copyText(prompt);
        if (status) status.textContent = 'Запит скопійовано. Вставте його у вибраний AI-сервіс.';
      } catch (error) {
        if (status) status.textContent = 'Не вдалося скопіювати автоматично. Виділіть текст у попередньому перегляді та скопіюйте вручну.';
      }
    };
    dialog.onclose = () => { if (invoker && typeof invoker.focus === 'function') invoker.focus(); };
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('#ucan-prompt-dialog-content').focus();
  };

  function sanitizeFilename(value) {
    const cleaned = String(value || '')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/\s+/g, '_')
      .slice(0, 80);
    return cleaned || '';
  }
  Interface.sanitizeFilename = sanitizeFilename;

  function wrapCanvasText(context, text, maxWidth) {
    const value = String(text || '—').replace(/\r\n?/g, '\n');
    const paragraphs = value.split('\n');
    const lines = [];
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) lines.push('');
      else {
        let line = '';
        words.forEach(word => {
          const candidate = line ? `${line} ${word}` : word;
          if (context.measureText(candidate).width <= maxWidth) { line = candidate; return; }
          if (line) lines.push(line);
          if (context.measureText(word).width <= maxWidth) { line = word; return; }
          let fragment = '';
          Array.from(word).forEach(character => {
            const next = fragment + character;
            if (context.measureText(next).width > maxWidth && fragment) {
              lines.push(fragment);
              fragment = character;
            } else fragment = next;
          });
          line = fragment;
        });
        if (line) lines.push(line);
      }
      if (paragraphIndex < paragraphs.length - 1) lines.push('');
    });
    return lines;
  }

  function createPdfCanvases({ title, label = 'Портфель мера', fields, data, note }) {
    const width = 1240;
    const height = 1754;
    const margin = 92;
    const maxWidth = width - margin * 2;
    const bottom = height - margin;
    const canvases = [];
    let canvas;
    let context;
    let y;

    function newPage() {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      canvases.push(canvas);
      y = margin;
    }
    function ensureSpace(required) { if (y + required > bottom) newPage(); }
    function drawText(text, options = {}) {
      const fontSize = options.fontSize || 28;
      const lineHeight = options.lineHeight || Math.round(fontSize * 1.42);
      const weight = options.weight || 400;
      const color = options.color || '#1f2a33';
      const gapAfter = options.gapAfter ?? 18;
      context.font = `${weight} ${fontSize}px Arial, "DejaVu Sans", sans-serif`;
      context.fillStyle = color;
      const lines = wrapCanvasText(context, text, options.maxWidth || maxWidth);
      for (const line of lines) {
        ensureSpace(lineHeight + gapAfter);
        if (line) context.fillText(line, margin, y);
        y += lineHeight;
      }
      y += gapAfter;
    }

    newPage();
    drawText(title, { fontSize: 42, lineHeight: 54, weight: 700, color: '#123f68', gapAfter: 10 });
    drawText(label, { fontSize: 30, lineHeight: 40, weight: 700, color: '#2d7b55', gapAfter: 34 });
    drawText('Локально створений навчальний артефакт. Дані не передавалися на сервер.', { fontSize: 22, lineHeight: 32, color: '#47545e', gapAfter: 32 });
    fields.forEach(field => {
      ensureSpace(110);
      context.strokeStyle = '#cfd9df';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(margin, y);
      context.lineTo(width - margin, y);
      context.stroke();
      y += 24;
      drawText(field.label, { fontSize: 24, lineHeight: 34, weight: 700, color: '#123f68', gapAfter: 8 });
      drawText((data[field.key] || '').trim() || '—', { fontSize: 24, lineHeight: 36, gapAfter: 28 });
    });
    if (note) {
      ensureSpace(130);
      context.strokeStyle = '#cfd9df';
      context.beginPath();
      context.moveTo(margin, y);
      context.lineTo(width - margin, y);
      context.stroke();
      y += 24;
      drawText('Примітка', { fontSize: 24, lineHeight: 34, weight: 700, color: '#123f68', gapAfter: 8 });
      drawText(note, { fontSize: 22, lineHeight: 33, color: '#47545e', gapAfter: 0 });
    }
    return canvases;
  }

  function base64ToBytes(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function buildImagePdf(canvases) {
    const encoder = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let length = 0;
    const pushBytes = bytes => { chunks.push(bytes); length += bytes.length; };
    const pushText = text => pushBytes(encoder.encode(text));
    const images = canvases.map(canvas => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      return { width: canvas.width, height: canvas.height, bytes: base64ToBytes(dataUrl.split(',')[1]) };
    });
    const objectCount = 2 + images.length * 3;
    const pageIds = images.map((_, index) => 3 + index * 3);
    pushText('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    function startObject(id) { offsets[id] = length; pushText(`${id} 0 obj\n`); }
    function endObject() { pushText('endobj\n'); }
    startObject(1); pushText('<< /Type /Catalog /Pages 2 0 R >>\n'); endObject();
    startObject(2); pushText(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] >>\n`); endObject();
    images.forEach((record, index) => {
      const pageId = 3 + index * 3;
      const contentId = pageId + 1;
      const imageId = pageId + 2;
      const imageName = `Im${index}`;
      const content = `q\n595 0 0 842 0 0 cm\n/${imageName} Do\nQ\n`;
      const contentBytes = encoder.encode(content);
      startObject(pageId); pushText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\n`); endObject();
      startObject(contentId); pushText(`<< /Length ${contentBytes.length} >>\nstream\n`); pushBytes(contentBytes); pushText('endstream\n'); endObject();
      startObject(imageId); pushText(`<< /Type /XObject /Subtype /Image /Width ${record.width} /Height ${record.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${record.bytes.length} >>\nstream\n`); pushBytes(record.bytes); pushText('\nendstream\n'); endObject();
    });
    const xrefOffset = length;
    pushText(`xref\n0 ${objectCount + 1}\n`);
    pushText('0000000000 65535 f \n');
    for (let id = 1; id <= objectCount; id += 1) pushText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    return new Blob(chunks, { type: 'application/pdf' });
  }

  Interface.downloadPortfolioPdf = async function downloadPortfolioPdf({ button, status, title, label, filename, fields, data, note }) {
    if (!button) throw new Error('PDF button is required');
    const original = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Створення PDF…';
    if (status) status.textContent = 'Створюємо PDF локально у Вашому браузері…';
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const canvases = createPdfCanvases({ title, label, fields, data, note });
      const blob = buildImagePdf(canvases);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      if (status) status.textContent = 'PDF створено та завантажено. Дані залишилися у Вашому браузері.';
    } catch (error) {
      console.error('Portfolio PDF generation failed', error);
      if (status) status.textContent = 'Не вдалося створити PDF. Перевірте налаштування браузера та спробуйте ще раз.';
      throw error;
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = original;
    }
  };

  window.UCANInterface = Object.freeze(Interface);
})();
