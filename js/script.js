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
  const pageNumberByRole = (role) => {
    const page = document.querySelector(`.lesson-page[data-page-role="${role}"]`);
    return page ? Number.parseInt(page.dataset.page, 10) : null;
  };
  const TEST_PAGE = pageNumberByRole('test');
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
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(percent));

    prevButton.disabled = currentPage === 1;
    const testGateActive = currentPage === TEST_PAGE && !isTestComplete();
    nextButton.disabled = currentPage === totalPages || testGateActive;
    nextButton.textContent = currentPage === totalPages ? 'Завершено' : 'Наступний розділ ➡️';
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
  nextButton.addEventListener('click', () => {
    if (currentPage === TEST_PAGE && !isTestComplete()) return;
    showPage(currentPage + 1);
  });

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
      if (!nextButton.disabled) showPage(currentPage + 1);
    }
  });

  const resetProgress = document.getElementById('reset-progress');
  resetProgress.addEventListener('click', () => {
    const confirmed = window.confirm('Скинути прогрес, відповіді самоперевірки та підсумкового тесту? Дані практичної форми та нотатка перед практикою залишаться збереженими.');
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

  document.getElementById('return-start').addEventListener('click', () => showPage(1));

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
      selfCheckResult.textContent = 'Карта достатньо сформована для практичного завдання. Перейдіть далі та заповніть її.';
    } else {
      selfCheckResult.textContent = 'Це ще не повна карта цифрового рішення. Уточніть позначені елементи та спробуйте ще раз.';
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
    portfolioStatus.textContent = success ? 'Чернетку збережено у Вашому браузері.' : 'Не вдалося зберегти чернетку в браузері. Ви можете продовжити роботу й надрукувати форму.';
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
    const confirmed = window.confirm('Очистити всі поля Карти цифрового рішення? Цю дію не можна скасувати.');
    if (!confirmed) return;
    portfolioForm.reset();
    storageRemove(STORAGE.form);
    portfolioStatus.textContent = 'Форму очищено.';
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

  document.getElementById('print-portfolio').addEventListener('click', () => {
    preparePrintValues();
    portfolioStatus.textContent = 'У системному вікні оберіть «Зберегти як PDF».';
    document.body.classList.add('print-portfolio');
    window.print();
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-portfolio'));

  // Final test. Completion is stored only after all answers are correct.
  const finalTestForm = document.getElementById('final-test-form');
  const finalTestResult = document.getElementById('final-test-result');
  const testGateNote = document.getElementById('test-gate-note');
  const correctAnswers = { 1: 'B', 2: 'B', 3: 'A', 4: 'B', 5: 'B', 6: 'B' };

  function getTestAnswers() {
    const answers = {};
    for (let i = 1; i <= 6; i += 1) {
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
    for (let i = 1; i <= 6; i += 1) {
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
      finalTestResult.textContent = 'Усі шість відповідей правильні. Ви можете перейти до завершальної сторінки.';
      storageSet(STORAGE.testCompleted, 'true');
      testGateNote.textContent = 'Тест завершено. Кнопка «Далі» доступна.';
    }
    updateNavigation();
    finalTestResult.focus();
  });

  function restoreTest() {
    const answers = parseJson(storageGet(STORAGE.testAnswers), {});
    for (let i = 1; i <= 6; i += 1) {
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
      testGateNote.textContent = 'Завершальна сторінка відкриється після правильної відповіді на всі шість питань.';
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

  async function copyPrompt(prompt, title) {
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
    aiStatus.textContent = copied
      ? `Промпт «${title}» скопійовано. Вставте його у вікно ШІ.`
      : 'Не вдалося скопіювати автоматично. Відкрийте промпт і скопіюйте текст вручну.';
    return copied;
  }

  function openPromptDialog(item) {
    const dialog = document.createElement('dialog');
    dialog.className = 'ai-prompt-dialog';
    dialog.innerHTML = `<div class="ai-dialog-inner"><h3>${item.icon} ${item.title}</h3><p>Скопіюйте текст і вставте його у вибраний ШІ-інструмент.</p><textarea class="ai-dialog-prompt" readonly></textarea><div class="ai-dialog-actions"><button class="button button-primary" type="button" data-dialog-copy>📋 Скопіювати промпт</button><button class="button button-secondary" type="button" data-dialog-close>✖️ Закрити</button></div></div>`;
    const preparedPrompt = buildPrompt(item);
    dialog.querySelector('textarea').value = preparedPrompt;
    dialog.querySelector('[data-dialog-copy]').addEventListener('click', () => copyPrompt(buildPrompt(item), item.title));
    dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialog.remove());
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.querySelector('textarea').focus();
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

      const copyButton = document.createElement('button');
      copyButton.className = 'button button-primary';
      copyButton.type = 'button';
      copyButton.textContent = '📋 Скопіювати промпт';
      copyButton.addEventListener('click', () => copyPrompt(buildPrompt(item), item.title));

      const viewButton = document.createElement('button');
      viewButton.className = 'button button-secondary';
      viewButton.type = 'button';
      viewButton.textContent = '👁️ Переглянути промпт';
      viewButton.addEventListener('click', () => openPromptDialog(item));

      const platformActions = document.createElement('div');
      platformActions.className = 'ai-platform-actions';
      platformActions.setAttribute('aria-label', 'Відкрити промпт у вибраному ШІ');

      const chatButton = document.createElement('a');
      chatButton.className = 'button button-quiet';
      chatButton.href = 'https://chatgpt.com/';
      chatButton.target = '_blank';
      chatButton.rel = 'noopener noreferrer';
      chatButton.textContent = '🤖 Відкрити ChatGPT ↗';
      chatButton.addEventListener('click', () => copyPrompt(buildPrompt(item), item.title));

      const geminiButton = document.createElement('a');
      geminiButton.className = 'button button-quiet';
      geminiButton.href = 'https://gemini.google.com/app';
      geminiButton.target = '_blank';
      geminiButton.rel = 'noopener noreferrer';
      geminiButton.textContent = '✨ Відкрити Gemini ↗';
      geminiButton.addEventListener('click', () => copyPrompt(buildPrompt(item), item.title));

      platformActions.append(chatButton, geminiButton);
      actions.append(copyButton, viewButton, platformActions);
      card.append(title, description, actions);
      aiGrid.appendChild(card);
    });
  }

  // Restore state after all listeners are ready.
  restoreTransitionReflection();
  restorePortfolio();
  restoreSelfCheck();
  restoreTest();
  const savedPage = Number.parseInt(storageGet(STORAGE.page, '1'), 10);
  showPage(Number.isFinite(savedPage) ? savedPage : 1, { focus: false, keepScroll: true });
})();
