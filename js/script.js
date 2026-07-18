(() => {
  'use strict';

  const STORAGE = {
    page: 'ucan_l03_rc_v1_current_page',
    progress: 'ucan_l03_rc_v1_progress',
    form: 'ucan_l03_rc_v1_portfolio_form',
    selfCheck: 'ucan_l03_rc_v1_self_check',
    testAnswers: 'ucan_l03_rc_v1_test_answers',
    testCompleted: 'ucan_l03_rc_v1_test_completed'
  };

  const pages = Array.from(document.querySelectorAll('.lesson-page'));
  const totalPages = pages.length;
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  const pageCounter = document.getElementById('page-counter');
  const progressPercent = document.getElementById('progress-percent');
  const progressFill = document.getElementById('progress-fill');
  const progressTrack = document.querySelector('.progress-track');
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
    pageCounter.textContent = `Сторінка ${currentPage} із ${totalPages}`;
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(percent));

    prevButton.disabled = currentPage === 1;
    const testGateActive = currentPage === 10 && !isTestComplete();
    nextButton.disabled = currentPage === totalPages || testGateActive;
    nextButton.textContent = currentPage === totalPages ? 'Завершено' : 'Далі';
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

    if (!options.keepScroll) window.scrollTo(0, 0);
    if (options.focus !== false) {
      const heading = pages[target - 1].querySelector('h1, h2[tabindex="-1"], h2');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  prevButton.addEventListener('click', () => showPage(currentPage - 1));
  nextButton.addEventListener('click', () => {
    if (currentPage === 10 && !isTestComplete()) return;
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
    const confirmed = window.confirm('Скинути прогрес, відповіді самоперевірки та підсумкового тесту? Дані практичної форми залишаться збереженими.');
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

  // Interactive self-check.
  const selfCheckForm = document.getElementById('self-check-form');
  const selfCheckResult = document.getElementById('self-check-result');
  const diagnosticPrompts = [
    'Назвіть, яку кліматичну дію або проблему підтримує це рішення.',
    'Сформулюйте, яке управлінське рішення має стати кращим.',
    'Уточніть, які дані потрібні і звідки вони беруться.',
    'Визначте, хто відповідає за дані та реагування.',
    'Опишіть, яку управлінську користь отримає команда.',
    'Назвіть перший реалістичний крок без великої закупівлі.'
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
        if (showSummary) feedback.textContent = `Потрібно уточнити: ${diagnosticPrompts[i - 1]}`;
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

  // Restore state after all listeners are ready.
  restorePortfolio();
  restoreSelfCheck();
  restoreTest();
  const savedPage = Number.parseInt(storageGet(STORAGE.page, '1'), 10);
  showPage(Number.isFinite(savedPage) ? savedPage : 1, { focus: false, keepScroll: true });
})();
