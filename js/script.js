(() => {
  'use strict';

  const STORAGE = {
    page: 'ucan_l03_rc_v1_current_page',
    progress: 'ucan_l03_rc_v1_progress',
    form: 'ucan_l03_rc_v1_portfolio_form',
    selfCheck: 'ucan_l03_rc_v1_self_check',
    testAnswers: 'ucan_l03_rc_v1_test_answers',
    testCompleted: 'ucan_l03_rc_v1_test_completed',
    transitionReflection: 'ucan_l03_rc_v1_transition_reflection'
  };

  const pages = Array.from(document.querySelectorAll('.lesson-page'));
  const totalPages = pages.length;
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const progressPercent = document.getElementById('progress-percent');
  const progressFill = document.getElementById('progress-fill');
  const progressTrack = document.querySelector('.progress-track');
  const progressText = document.getElementById('progress-text');
  const pageLabel = document.getElementById('page-label');
  const navPageCount = document.getElementById('nav-page-count');
  const pageLinks = Array.from(document.querySelectorAll('[data-page-link]'));
  const pageNumberByRole = (role) => {
    const page = document.querySelector(`.lesson-page[data-page-role="${role}"]`);
    return page ? Number.parseInt(page.dataset.page, 10) : null;
  };
  const TEST_PAGE = pageNumberByRole('test');
  const NEXT_LESSON_URL = 'https://clusterceu-crypto.github.io/UCAN-Lesson04/';
  let currentPage = 1;

  function storageGet(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function storageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Local storage may be unavailable; the lesson remains usable in this session.
    }
  }

  function parseJson(value, fallback) {
    if (!value) return fallback;
    try { return JSON.parse(value); } catch (error) { return fallback; }
  }

  function isTestComplete() {
    return storageGet(STORAGE.testCompleted, 'false') === 'true';
  }

  function updateNavigation() {
    const percent = Math.round((currentPage / totalPages) * 100);
    const activePage = pages[currentPage - 1];
    const activeLabel = activePage?.dataset.pageLabel || '';
    progressPercent.textContent = `${percent}%`;
    progressText.textContent = `Сторінка ${currentPage} із ${totalPages}`;
    progressFill.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(percent));
    progressTrack.setAttribute('aria-valuetext', `Сторінка ${currentPage} із ${totalPages}, прогрес ${percent}%`);
    if (pageLabel) pageLabel.textContent = activeLabel;
    if (navPageCount) navPageCount.textContent = `Сторінка ${currentPage} із ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    const testGateActive = currentPage === TEST_PAGE && !isTestComplete();
    nextButton.disabled = testGateActive;
    nextButton.textContent = currentPage === totalPages ? 'Перейти до заняття 04 ➡️' : 'Наступний розділ ➡️';
    updateSectionNavigation();
  }

  function updateSectionNavigation() {
    const visited = parseJson(storageGet(STORAGE.progress), []);
    const maxVisited = visited.length ? Math.max(...visited) : 1;
    pageLinks.forEach((link) => {
      const target = Number.parseInt(link.dataset.pageLink, 10);
      const active = target === currentPage;
      const requiresTest = link.dataset.requiresTest === 'true';
      const available = active || (target <= maxVisited && (!requiresTest || isTestComplete()));
      link.disabled = !available;
      link.setAttribute('aria-disabled', String(!available));
      link.classList.toggle('is-completed', target < currentPage && visited.includes(target));
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      link.title = available ? '' : (requiresTest ? 'Спочатку правильно виконайте підсумковий тест.' : 'Цей розділ стане доступним після проходження попереднього розділу.');
    });
  }

  function showPage(pageNumber, options = {}) {
    const target = Math.min(Math.max(pageNumber, 1), totalPages);
    currentPage = target;
    pages.forEach((page, index) => {
      const active = index + 1 === target;
      page.hidden = !active;
      page.classList.toggle('is-active', active);
    });
    storageSet(STORAGE.page, String(target));
    const progress = parseJson(storageGet(STORAGE.progress), []);
    if (!progress.includes(target)) progress.push(target);
    storageSet(STORAGE.progress, JSON.stringify(progress));
    updateNavigation();

    if (options.focus !== false) {
      const heading = pages[target - 1].querySelector('h1, h2[tabindex="-1"], h2');
      if (heading) heading.focus({ preventScroll: true });
    }
    if (!options.keepScroll) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        });
      });
    }
  }

  prevButton.addEventListener('click', () => showPage(currentPage - 1));
  function advancePage() {
    if (currentPage === totalPages) {
      window.location.assign(NEXT_LESSON_URL);
      return;
    }
    if (currentPage === TEST_PAGE && !isTestComplete()) return;
    showPage(currentPage + 1);
  }

  nextButton.addEventListener('click', advancePage);
  pageLinks.forEach((link) => link.addEventListener('click', () => {
    if (!link.disabled) showPage(Number.parseInt(link.dataset.pageLink, 10));
  }));

  document.addEventListener('keydown', (event) => {
    if (!event.altKey) return;
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
    if (isTyping) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (currentPage > 1) showPage(currentPage - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (!nextButton.disabled) advancePage();
    }
  });

  const resetProgress = document.getElementById('reset-progress');
  resetProgress.addEventListener('click', () => {
    const confirmed = window.confirm('Скинути прогрес, відповіді самоперевірки та підсумкового тесту? Дані Практичної картки та нотатка перед практикою залишаться збереженими.');
    if (!confirmed) return;
    storageRemove(STORAGE.page);
    storageRemove(STORAGE.progress);
    storageRemove(STORAGE.selfCheck);
    storageRemove(STORAGE.testAnswers);
    storageRemove(STORAGE.testCompleted);
    restoreSelfCheck();
    restoreTest();
    showPage(1);
  });

  // Learning Transition Layer: optional locally saved reflection.
  const transitionReflectionInput = document.getElementById('transition-reflection-input');
  const transitionReflectionStatus = document.getElementById('transition-reflection-status');
  let transitionSaveTimer = null;

  function getTransitionReflection() {
    return transitionReflectionInput ? transitionReflectionInput.value.trim() : '';
  }

  function restoreTransitionReflection() {
    if (!transitionReflectionInput) return;
    transitionReflectionInput.value = storageGet(STORAGE.transitionReflection, '');
  }

  if (transitionReflectionInput) {
    transitionReflectionInput.addEventListener('input', () => {
      const saved = storageSet(STORAGE.transitionReflection, transitionReflectionInput.value);
      if (transitionReflectionStatus) {
        transitionReflectionStatus.textContent = saved
          ? 'Збережено локально.'
          : 'Не вдалося зберегти нотатку у браузері.';
        window.clearTimeout(transitionSaveTimer);
        transitionSaveTimer = window.setTimeout(() => {
          transitionReflectionStatus.textContent = '';
        }, 1800);
      }
    });
  }

  // Interactive self-check.
  const selfCheckForm = document.getElementById('self-check-form');
  const selfCheckResult = document.getElementById('self-check-result');
  const diagnosticPrompts = [
    {
      instruction: 'Назвіть, яку кліматичну дію або проблему підтримує це рішення.',
      example: 'Наприклад: зменшити споживання теплової та електричної енергії у школах громади.'
    },
    {
      instruction: 'Сформулюйте, яке управлінське рішення має стати кращим.',
      example: 'Наприклад: визначати, які школи потрібно перевірити або модернізувати першими.'
    },
    {
      instruction: 'Уточніть, які дані потрібні і звідки вони беруться.',
      example: 'Наприклад: щомісячні показники споживання тепла й електроенергії з рахунків та лічильників кожної школи.'
    },
    {
      instruction: 'Визначте, хто відповідає за дані та реагування.',
      example: 'Наприклад: відповідальні за дані — директори шкіл та енергоменеджер; рішення готує управління освіти.'
    },
    {
      instruction: 'Опишіть, яку управлінську користь отримає команда.',
      example: 'Наприклад: команда бачить найбільші відхилення, порівнює школи та спрямовує перевірки туди, де втрати найвищі.'
    },
    {
      instruction: 'Назвіть перший реалістичний крок без великої закупівлі.',
      example: 'Наприклад: зібрати за останні 12 місяців рахунки 3–5 шкіл і створити просту порівняльну таблицю.'
    }
  ];

  function getSelfCheckAnswers() {
    const answers = {};
    for (let i = 1; i <= 6; i += 1) {
      const selected = selfCheckForm.querySelector(`input[name="diagnostic-${i}"]:checked`);
      if (selected) answers[i] = selected.value;
    }
    return answers;
  }

  function renderSelfCheck(answers, showSummary) {
    let allYes = true;
    let hasAllAnswers = true;
    for (let i = 1; i <= 6; i += 1) {
      const fieldset = selfCheckForm.querySelector(`[data-diagnostic="${i}"]`);
      const feedback = document.getElementById(`diagnostic-feedback-${i}`);
      fieldset.classList.remove('needs-review', 'is-correct');
      feedback.textContent = '';
      if (!answers[i]) {
        hasAllAnswers = false;
        allYes = false;
        if (showSummary) feedback.textContent = 'Оберіть один варіант.';
      } else if (answers[i] === 'clarify') {
        allYes = false;
        fieldset.classList.add('needs-review');
        if (showSummary) feedback.innerHTML = `<strong>Потрібно уточнити.</strong> ${diagnosticPrompts[i - 1].instruction}<br><span class="diagnostic-example">${diagnosticPrompts[i - 1].example}</span>`;
      } else {
        fieldset.classList.add('is-correct');
        if (showSummary) feedback.textContent = 'Цей елемент визначено.';
      }
    }

    if (!showSummary) {
      selfCheckResult.textContent = '';
      return;
    }
    if (!hasAllAnswers) {
      selfCheckResult.textContent = 'Дайте відповідь на всі шість питань.';
    } else if (allYes) {
      selfCheckResult.textContent = 'Практична картка достатньо сформована для наступного кроку. Перейдіть далі та заповніть її.';
    } else {
      selfCheckResult.textContent = 'Практичну картку ще потрібно уточнити. Перегляньте позначені елементи та спробуйте ще раз.';
    }
    selfCheckResult.focus();
  }

  selfCheckForm.addEventListener('change', () => {
    const answers = getSelfCheckAnswers();
    storageSet(STORAGE.selfCheck, JSON.stringify(answers));
  });
  selfCheckForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = getSelfCheckAnswers();
    storageSet(STORAGE.selfCheck, JSON.stringify(answers));
    renderSelfCheck(answers, true);
  });

  function restoreSelfCheck() {
    const answers = parseJson(storageGet(STORAGE.selfCheck), {});
    for (let i = 1; i <= 6; i += 1) {
      const value = answers[i];
      const radio = value ? selfCheckForm.querySelector(`input[name="diagnostic-${i}"][value="${value}"]`) : null;
      selfCheckForm.querySelectorAll(`input[name="diagnostic-${i}"]`).forEach((input) => { input.checked = false; });
      if (radio) radio.checked = true;
    }
    renderSelfCheck(answers, false);
  }

  // Portfolio form persistence and print preparation.
  const portfolioForm = document.getElementById('portfolio-form');
  const portfolioStatus = document.getElementById('portfolio-save-status');
  const portfolioFields = Array.from(portfolioForm.querySelectorAll('textarea, input[type="text"], input[type="radio"]'));
  let saveTimer = null;

  function collectPortfolioData() {
    const data = {};
    portfolioFields.forEach((field) => {
      if (field.type === 'radio') {
        if (field.checked) data[field.name] = field.value;
      } else {
        data[field.name] = field.value;
      }
    });
    return data;
  }

  function savePortfolio() {
    const success = storageSet(STORAGE.form, JSON.stringify(collectPortfolioData()));
    portfolioStatus.textContent = success ? 'Практичну картку збережено у Вашому браузері.' : 'Не вдалося зберегти Практичну картку в браузері. Ви можете продовжити роботу й завантажити PDF.';
  }

  portfolioForm.addEventListener('input', () => {
    portfolioStatus.textContent = 'Зберігаємо…';
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(savePortfolio, 250);
  });
  portfolioForm.addEventListener('change', () => {
    window.clearTimeout(saveTimer);
    savePortfolio();
  });

  function restorePortfolio() {
    const data = parseJson(storageGet(STORAGE.form), {});
    portfolioFields.forEach((field) => {
      if (field.type === 'radio') field.checked = data[field.name] === field.value;
      else if (Object.prototype.hasOwnProperty.call(data, field.name)) field.value = data[field.name];
    });
  }

  document.getElementById('clear-portfolio').addEventListener('click', () => {
    const confirmed = window.confirm('Очистити всі поля Практичної картки? Цю дію не можна скасувати.');
    if (!confirmed) return;
    portfolioForm.reset();
    storageRemove(STORAGE.form);
    portfolioStatus.textContent = 'Практичну картку очищено.';
  });


  function getTransitionContext() {
    const data = collectPortfolioData();
    const lines = [
      `Громада: ${data.communityName || 'не вказано'}`,
      `Ключова тема / напрям: ${data.keyTheme || 'не вказано'}`,
      `Кліматична дія: ${data.climateAction || 'не визначено'}`,
      `Цифрове рішення: ${data.digitalSolution || 'не визначено'}`
    ];
    return `Контекст для наступного заняття UCAN:\n${lines.join('\n')}`;
  }

  document.getElementById('copy-transition-context').addEventListener('click', async () => {
    const text = getTransitionContext();
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      } else {
        copied = fallbackCopy(text);
      }
    } catch (error) {
      copied = fallbackCopy(text);
    }
    portfolioStatus.textContent = copied
      ? 'Контекст громади скопійовано. Вставте його в наступному занятті.'
      : 'Не вдалося скопіювати автоматично. Скопіюйте значення полів вручну.';
  });

  function preparePrintValues() {
    document.querySelectorAll('[data-print-for]').forEach((output) => {
      const source = document.getElementById(output.getAttribute('data-print-for'));
      output.textContent = source && source.value.trim() ? source.value : '—';
    });
    const status = portfolioForm.querySelector('input[name="dataStatus"]:checked');
    document.getElementById('print-data-status').textContent = status ? status.value : '—';
  }

  function normalizePdfText(value) {
    return String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim() || '—';
  }

  function sanitizeFilePart(value) {
    const cleaned = String(value || '')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '');
    return cleaned.slice(0, 70);
  }

  function wrapCanvasText(context, text, maxWidth) {
    const paragraphs = normalizePdfText(text).split('\n');
    const lines = [];
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push('');
      } else {
        let line = words.shift();
        words.forEach((word) => {
          const candidate = `${line} ${word}`;
          if (context.measureText(candidate).width <= maxWidth) line = candidate;
          else {
            lines.push(line);
            line = word;
          }
        });
        lines.push(line);
      }
      if (paragraphIndex < paragraphs.length - 1) lines.push('');
    });
    return lines;
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function concatByteArrays(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(total);
    let offset = 0;
    parts.forEach((part) => {
      output.set(part, offset);
      offset += part.length;
    });
    return output;
  }

  function textBytes(text) {
    return new TextEncoder().encode(text);
  }

  function buildImagePdf(pageImages) {
    const objects = [];
    const pageObjectIds = [];
    const imageObjectIds = [];
    const contentObjectIds = [];
    let nextId = 3;

    pageImages.forEach(() => {
      pageObjectIds.push(nextId++);
      imageObjectIds.push(nextId++);
      contentObjectIds.push(nextId++);
    });

    objects[1] = textBytes('<< /Type /Catalog /Pages 2 0 R >>');
    objects[2] = textBytes(`<< /Type /Pages /Count ${pageImages.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>`);

    pageImages.forEach((page, index) => {
      const pageId = pageObjectIds[index];
      const imageId = imageObjectIds[index];
      const contentId = contentObjectIds[index];
      const imageName = `Im${index + 1}`;
      const content = `q\n595 0 0 842 0 0 cm\n/${imageName} Do\nQ\n`;
      objects[pageId] = textBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      objects[imageId] = concatByteArrays([
        textBytes(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.length} >>\nstream\n`),
        page.bytes,
        textBytes('\nendstream')
      ]);
      objects[contentId] = textBytes(`<< /Length ${content.length} >>\nstream\n${content}endstream`);
    });

    const chunks = [textBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')];
    const offsets = [0];
    let position = chunks[0].length;
    for (let id = 1; id < objects.length; id += 1) {
      offsets[id] = position;
      const chunk = concatByteArrays([textBytes(`${id} 0 obj\n`), objects[id], textBytes('\nendobj\n')]);
      chunks.push(chunk);
      position += chunk.length;
    }
    const xrefOffset = position;
    let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id += 1) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    xref += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(textBytes(xref));
    return new Blob([concatByteArrays(chunks)], { type: 'application/pdf' });
  }

  function createPortfolioPdfPages(data) {
    const width = 1240;
    const height = 1754;
    const margin = 92;
    const contentWidth = width - (margin * 2);
    const lineHeight = 34;
    const sectionGap = 28;
    const pages = [];
    let canvas;
    let context;
    let y;

    function newPage() {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.textBaseline = 'top';
      y = margin;
      context.fillStyle = '#06265f';
      context.fillRect(0, 0, width, 24);
    }

    function finishPage() {
      context.font = '24px Arial, sans-serif';
      context.fillStyle = '#445066';
      context.fillText(`UCAN · Заняття 03 · Сторінка ${pages.length + 1}`, margin, height - 58);
      pages.push({ width, height, bytes: dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92)) });
    }

    function ensureSpace(requiredHeight) {
      if (y + requiredHeight > height - 100) {
        finishPage();
        newPage();
      }
    }

    function drawTitle(title, subtitle) {
      context.fillStyle = '#06265f';
      context.font = 'bold 46px Arial, sans-serif';
      const titleLines = wrapCanvasText(context, title, contentWidth);
      titleLines.forEach((line) => {
        context.fillText(line, margin, y);
        y += 56;
      });
      context.font = '28px Arial, sans-serif';
      context.fillStyle = '#123f78';
      wrapCanvasText(context, subtitle, contentWidth).forEach((line) => {
        context.fillText(line, margin, y);
        y += 38;
      });
      y += 18;
      context.strokeStyle = '#149eb5';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(margin, y);
      context.lineTo(width - margin, y);
      context.stroke();
      y += 34;
    }

    function drawField(label, value) {
      context.font = 'bold 27px Arial, sans-serif';
      const labelLines = wrapCanvasText(context, label, contentWidth - 40);
      context.font = '27px Arial, sans-serif';
      const valueLines = wrapCanvasText(context, normalizePdfText(value), contentWidth - 40);
      const boxHeight = 28 + (labelLines.length * 34) + 14 + (valueLines.length * lineHeight) + 28;
      ensureSpace(boxHeight + sectionGap);
      context.fillStyle = '#f4f6f8';
      context.strokeStyle = '#cbd4df';
      context.lineWidth = 2;
      context.fillRect(margin, y, contentWidth, boxHeight);
      context.strokeRect(margin, y, contentWidth, boxHeight);
      let textY = y + 22;
      context.font = 'bold 27px Arial, sans-serif';
      context.fillStyle = '#06265f';
      labelLines.forEach((line) => {
        context.fillText(line, margin + 20, textY);
        textY += 34;
      });
      textY += 8;
      context.font = '27px Arial, sans-serif';
      context.fillStyle = '#172033';
      valueLines.forEach((line) => {
        context.fillText(line, margin + 20, textY);
        textY += lineHeight;
      });
      y += boxHeight + sectionGap;
    }

    newPage();
    drawTitle('Практична картка цифрового рішення для кліматичної дії', 'Портфель мера · UCAN · Заняття 03');
    drawField('Громада', data.communityName);
    drawField('Ключова тема / напрям', data.keyTheme);
    drawField('1. Кліматична дія', data.climateAction);
    drawField('2. Управлінське питання', data.managementQuestion);
    drawField('3. Цифрове рішення', data.digitalSolution);
    drawField('4. Необхідні дані', data.neededData);
    drawField('5. Джерело даних / відповідальний', data.dataOwner);
    drawField('6. Управлінська користь', data.managementBenefit);
    drawField('7. Перший крок', data.firstStep);
    drawField('8. Показник результату 1', data.indicator1);
    drawField('9. Показник результату 2', data.indicator2);
    drawField('10. Показник результату 3', data.indicator3);
    drawField('Статус даних', data.dataStatus);
    ensureSpace(125);
    context.fillStyle = '#eaf7ed';
    context.strokeStyle = '#0b722d';
    context.lineWidth = 2;
    context.fillRect(margin, y, contentWidth, 112);
    context.strokeRect(margin, y, contentWidth, 112);
    context.font = '24px Arial, sans-serif';
    context.fillStyle = '#172033';
    wrapCanvasText(context, 'Чернетка створена учасником. Перевірте дані й припущення разом із відповідальними підрозділами громади.', contentWidth - 40).forEach((line) => {
      context.fillText(line, margin + 20, y + 22);
      y += 31;
    });
    finishPage();
    return pages;
  }

  async function downloadPortfolioPdf() {
    const button = document.getElementById('print-portfolio');
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ Формуємо PDF…';
    portfolioStatus.textContent = 'Формуємо PDF у Вашому браузері…';
    try {
      savePortfolio();
      const data = collectPortfolioData();
      const pages = createPortfolioPdfPages(data);
      const blob = buildImagePdf(pages);
      const community = sanitizeFilePart(data.communityName);
      const filename = community
        ? `UCAN_L03_Практична_картка_${community}.pdf`
        : 'UCAN_L03_Практична_картка.pdf';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      portfolioStatus.textContent = `PDF сформовано: ${filename}`;
    } catch (error) {
      console.error(error);
      portfolioStatus.textContent = 'Не вдалося сформувати PDF. Перевірте браузер і спробуйте ще раз.';
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  document.getElementById('print-portfolio').addEventListener('click', downloadPortfolioPdf);

  // Final test. Completion is stored only after all answers are correct.
  const finalTestForm = document.getElementById('final-test-form');
  const finalTestResult = document.getElementById('final-test-result');
  const testGateNote = document.getElementById('test-gate-note');
  const correctAnswers = { 1: 'C', 2: 'B', 3: 'D', 4: 'A', 5: 'C' };

  function getTestAnswers() {
    const answers = {};
    for (let i = 1; i <= 5; i += 1) {
      const selected = finalTestForm.querySelector(`input[name="test-${i}"]:checked`);
      if (selected) answers[i] = selected.value;
    }
    return answers;
  }

  function saveTestAnswers() {
    storageSet(STORAGE.testAnswers, JSON.stringify(getTestAnswers()));
  }
  finalTestForm.addEventListener('change', saveTestAnswers);

  finalTestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const answers = getTestAnswers();
    storageSet(STORAGE.testAnswers, JSON.stringify(answers));
    const incorrect = [];
    const unanswered = [];
    for (let i = 1; i <= 5; i += 1) {
      const fieldset = finalTestForm.querySelector(`[data-test-question="${i}"]`);
      const status = document.getElementById(`test-status-${i}`);
      fieldset.classList.remove('needs-review', 'is-correct');
      if (!answers[i]) {
        unanswered.push(i);
        fieldset.classList.add('needs-review');
        status.textContent = 'Оберіть відповідь.';
      } else if (answers[i] === correctAnswers[i]) {
        fieldset.classList.add('is-correct');
        status.textContent = 'Правильно.';
      } else {
        incorrect.push(i);
        fieldset.classList.add('needs-review');
        status.textContent = 'Перегляньте відповідь і спробуйте ще раз.';
      }
    }

    if (unanswered.length > 0) {
      finalTestResult.textContent = `Дайте відповідь на всі питання. Без відповіді: ${unanswered.join(', ')}.`;
      storageSet(STORAGE.testCompleted, 'false');
    } else if (incorrect.length > 0) {
      finalTestResult.textContent = `Є відповіді, які варто переглянути: ${incorrect.join(', ')}. Спробуйте ще раз.`;
      storageSet(STORAGE.testCompleted, 'false');
    } else {
      finalTestResult.textContent = 'Усі п’ять відповідей правильні. Ви можете перейти до завершальної сторінки.';
      storageSet(STORAGE.testCompleted, 'true');
      testGateNote.textContent = 'Тест завершено. Кнопка «Далі» доступна.';
    }
    updateNavigation();
    finalTestResult.focus();
  });

  function restoreTest() {
    const answers = parseJson(storageGet(STORAGE.testAnswers), {});
    for (let i = 1; i <= 5; i += 1) {
      finalTestForm.querySelectorAll(`input[name="test-${i}"]`).forEach((input) => { input.checked = false; });
      const value = answers[i];
      const radio = value ? finalTestForm.querySelector(`input[name="test-${i}"][value="${value}"]`) : null;
      if (radio) radio.checked = true;
      const fieldset = finalTestForm.querySelector(`[data-test-question="${i}"]`);
      const status = document.getElementById(`test-status-${i}`);
      fieldset.classList.remove('needs-review', 'is-correct');
      status.textContent = '';
    }
    if (isTestComplete()) {
      finalTestResult.textContent = 'Тест уже завершено правильно. Ви можете перейти до завершальної сторінки.';
      testGateNote.textContent = 'Тест завершено. Кнопка «Далі» доступна.';
    } else {
      finalTestResult.textContent = '';
      testGateNote.textContent = 'Завершальна сторінка відкриється після правильної відповіді на всі п’ять питань.';
    }
    updateNavigation();
  }

  // Contextual AI assistant for the practical assignment.
  const aiPack = window.UCAN_AI_PROMPT_PACK;
  const aiGrid = document.getElementById('ai-prompt-grid');
  const aiStatus = document.getElementById('ai-copy-status');

  function fallbackCopy(text) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  }


  const portfolioPromptLabels = {
    communityName: 'Громада',
    keyTheme: 'Ключова тема / напрям',
    climateAction: 'Кліматична дія',
    managementQuestion: 'Управлінське питання',
    digitalSolution: 'Цифрове рішення',
    neededData: 'Необхідні дані',
    dataOwner: 'Джерело даних / відповідальний',
    managementBenefit: 'Управлінська користь',
    firstStep: 'Перший крок',
    indicator1: 'Показник результату 1',
    indicator2: 'Показник результату 2',
    indicator3: 'Показник результату 3',
    dataStatus: 'Статус даних'
  };

  function buildPortfolioContext(options = {}) {
    const data = collectPortfolioData();
    const entries = Object.entries(portfolioPromptLabels)
      .map(([key, label]) => {
        const value = typeof data[key] === 'string' ? data[key].trim() : '';
        return value ? `- ${label}: ${value}` : '';
      })
      .filter(Boolean);

    const transitionReflection = getTransitionReflection();
    const selfCheckAnswers = getSelfCheckAnswers();
    const selfCheckEntries = Object.entries(selfCheckAnswers).map(([key, value]) => {
      const label = diagnosticPrompts[Number(key) - 1]?.instruction || `Пункт ${key}`;
      const status = value === 'yes' ? 'визначено' : 'потрібно уточнити';
      return `- ${label} — ${status}`;
    });

    if (entries.length === 0 && selfCheckEntries.length === 0 && !transitionReflection) {
      return `

ДАНІ УЧАСНИКА ЩЕ НЕ ЗАПОВНЕНІ
Попроси учасника спочатку заповнити Карту цифрового рішення. Не вигадуй контекст громади.`;
    }

    const blocks = [];
    if (transitionReflection) blocks.push(`НОТАТКА ПЕРЕД ПРАКТИКОЮ
- Управлінське рішення, яке найбільше виграє від кращих даних: ${transitionReflection}`);
    if (entries.length) blocks.push(`ЗАПОВНЕНА КАРТА УЧАСНИКА
${entries.join('\n')}`);
    if (options.includeSelfCheck && selfCheckEntries.length) {
      blocks.push(`РЕЗУЛЬТАТ ІНТЕРАКТИВНОЇ САМОПЕРЕВІРКИ
${selfCheckEntries.join('\n')}`);
    }

    return `

${blocks.join('\n\n')}

Працюй лише з наведеними відповідями учасника. Не замінюй їх загальними порадами. Якщо якогось елемента бракує, прямо назви прогалину та постав уточнювальне запитання.`;
  }

  function buildPrompt(item) {
    const isReview = item.id === 'review';
    return `${item.prompt}${buildPortfolioContext({ includeSelfCheck: isReview })}`;
  }

  async function copyPrompt(prompt, title, button = null, status = aiStatus) {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt);
        copied = true;
      } else {
        copied = fallbackCopy(prompt);
      }
    } catch (error) {
      copied = fallbackCopy(prompt);
    }
    if (status) {
      status.textContent = copied
        ? 'Промпт скопійовано. Тепер відкрийте AI-сервіс і вставте його в новий чат.'
        : 'Не вдалося скопіювати автоматично. Спробуйте ще раз або скористайтеся іншим способом копіювання у браузері.';
      status.className = `ai-copy-status ${copied ? 'is-success' : 'is-error'}`;
    }
    if (button && copied) {
      const originalLabel = button.dataset.originalLabel || button.textContent;
      button.dataset.originalLabel = originalLabel;
      button.textContent = '✓ Скопійовано';
      button.classList.add('is-success');
      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove('is-success');
        if (status) {
          status.textContent = '';
          status.className = 'ai-copy-status';
        }
      }, 1800);
    }
    return copied;
  }

  if (aiPack && aiGrid && Array.isArray(aiPack.prompts)) {
    aiPack.prompts.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'ai-prompt-card';
      const title = document.createElement('h4');
      title.textContent = `${item.icon} ${item.title}`;
      const description = document.createElement('p');
      description.textContent = item.description;
      const actions = document.createElement('div');
      actions.className = 'ai-prompt-actions';
      const status = document.createElement('p');
      status.className = 'ai-copy-status';
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('role', 'status');

      const copyButton = document.createElement('button');
      copyButton.className = 'button button-primary';
      copyButton.type = 'button';
      copyButton.textContent = '📋 Скопіювати промпт';
      copyButton.addEventListener('click', () => copyPrompt(buildPrompt(item), item.title, copyButton, status));

      actions.append(copyButton);
      card.append(title, description, actions, status);
      aiGrid.appendChild(card);
    });
  }

  document.querySelectorAll('.ai-service-actions a').forEach((link) => link.addEventListener('click', () => {
    const service = link.textContent.replace('Відкрити ', '').replace(' ↗', '').trim();
    aiStatus.textContent = `${service} відкривається в новій вкладці. Вставте скопійований промпт у новий чат.`;
    aiStatus.className = 'ai-copy-status';
  }));

  // Restore state after all listeners are ready.
  restoreTransitionReflection();
  restorePortfolio();
  restoreSelfCheck();
  restoreTest();
  const savedPage = Number.parseInt(storageGet(STORAGE.page, '1'), 10);
  showPage(Number.isFinite(savedPage) ? savedPage : 1, { focus: false, keepScroll: true });
})();
