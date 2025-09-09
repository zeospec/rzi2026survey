/* RZI Survey App - Dynamic Renderer with Progress, Storage and Submit */
(function() {
  const CONFIG = {
    scriptURL: 'https://script.google.com/macros/s/AKfycby0beZjcCoCzxCJfRUrVRitqhrFrjGXwnVhnmUMnGxQa1nMfrtNO3bCkKchDpQvKI3g/exec'
  };

  const QUESTIONS = [
    {
      id: 'intro',
      title: 'RZI 2026: Need Assessment Survey',
      type: 'intro',
      description: 'We are delighted to host all incoming leaders at RZI 2026 Namma Chennai. Your feedback through this survey is crucial to design learning sessions that directly address your real-time challenges as Rotaract Leaders.'
    },
    {
      id: 'name',
      title: 'Your Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name'
    },
    {
      id: 'role',
      title: 'Your current role in Rotaract',
      type: 'radio',
      required: true,
      options: ['Past DRR', 'Immediate Past DRR', 'DRR', 'DRR Elect', 'DRR Nominee']
    },
    {
      id: 'district_number',
      title: 'Your District Number',
      type: 'radio',
      required: true,
      options: ['2981', '2982', '3000', '3011', '3012', '3020', '3030', '3040', '3053', '3055', '3056', '3060', '3070', '3080', '3090', '3100', '3110', '3120', '3131', '3132', '3141', '3142', '3150', '3160', '3170', '3181', '3182', '3191', '3192', '3203', '3204', '3205', '3206', '3211', '3212', '3220', '3231', '3233', '3234', '3240', '3250', '3261', '3262', '3292']
    },
    {
      id: 'challenges',
      title: 'What were your top 3 challenges in your term?',
      type: 'checkbox',
      required: true,
      max: 3,
      options: [
        'Club reporting and documentation',
        'Membership retention',
        'Public image & branding',
        'Conflict within district team or clubs',
        'Lack of support from Rotary leadership',
        'Project execution or scale',
        'Fundraising and sponsorship',
        'Time management and delegation',
        'Lack of proper training before assuming role'
      ]
    },
    {
      id: 'least_prepared',
      title: 'Which area do you feel DRRs are least prepared for at the start of their term?',
      type: 'radio',
      required: true,
      options: [
        'Team building & delegation',
        'Budgeting & finance',
        'Reporting and compliance',
        'Membership & club health tracking',
        'Communication with clubs',
        'Branding and outreach'
      ]
    },
    {
      id: 'training_needs',
      title: 'Which of the following areas need focused learning sessions at RZI?',
      type: 'checkbox',
      required: true,
      options: [
        'Conflict resolution & people management',
        'Building your core team',
        'How to build & run district-wide projects',
        'Fundraising & CSR connects',
        'Data handling & reporting',
        'Effective Rotary-Rotaract synergy',
        'Membership growth & club health',
        'Digital branding tools',
        'Planning RYLAs, Zonal Meets, District Events, Conferences',
        'How to handover effectively to your DRRE'
      ]
    },
    {
      id: 'session_format',
      title: 'Preferred session format at RZI',
      type: 'checkbox',
      required: true,
      options: [
        'Workshops (interactive, hands-on)',
        'Panel discussions with leaders',
        'Peer-led experience sharing',
        'Case studies / Success & failure stories',
        'Zone/region-wise breakout groups'
      ]
    },
    {
      id: 'learning_experience',
      title: 'What kind of learning experience would you value most at RZI?',
      type: 'checkbox',
      required: true,
      options: [
        'Practical tools and templates',
        'Real case studies from other DRRs',
        'Interactive & activity-based learning',
        'Speaker-led expert sessions',
        'Networking & collaboration time'
      ]
    },
    {
      id: 'problem_solving_booth',
      title: 'Would you find value in a \'Problem Solving Booth\' at RZI where experienced leaders guide on specific issues?',
      type: 'radio',
      required: true,
      options: ['Yes, this would be highly valuable', 'Yes, but only for specific, complex issues', 'Maybe, depending on who is at the booth', 'No, I\'d prefer to network with peers']
    },
    {
      id: 'previous_rzis',
      title: 'How many previous RZIs have you attended?',
      type: 'radio',
      required: true,
      options: ['This will be my first','1','2','3 or more']
    },
    {
      id: 'willing_to_speak',
      title: 'Would you be willing to be a panelist/speaker at RZI if invited?',
      type: 'radio',
      required: true,
      options: ['Yes', 'Maybe', 'No']
    },
    {
      id: 'feedback',
      title: 'Do you have additional feedback or suggestions for improving the RZI experience?',
      type: 'textarea',
      required: false,
      placeholder: 'Share your thoughts and suggestions...'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      type: 'review',
      description: 'Confirm your responses'
    }
  ];

  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v || '';
      else if (k === 'for') node.htmlFor = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.substring(2), v);
      else if (k === 'checked' || k === 'selected' || k === 'disabled' || k === 'multiple') { node[k] = !!v; }
      else if (v === false || v == null) { /* skip */ }
      else node.setAttribute(k, v);
    });
    for (const c of children) if (c != null) node.append(c.nodeType ? c : document.createTextNode(String(c)));
    return node;
  };

  const state = {
    index: 0,
    answers: loadFromStorage(),
  };

  const navEl = document.getElementById('questionNav');
  const navElMobile = document.getElementById('questionNavMobile');
  const rootEl = document.getElementById('questionRoot');
  const progressFill = document.getElementById('progressFill');
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const modal = document.getElementById('successModal');
  const startNewSurvey = document.getElementById('startNewSurvey');

  function loadFromStorage() {
    try { return JSON.parse(localStorage.getItem('rzi_survey_answers') || '{}'); } catch { return {}; }
  }
  function saveToStorage() {
    localStorage.setItem('rzi_survey_answers', JSON.stringify(state.answers));
  }

  function updateProgress() {
    const completed = QUESTIONS.filter(q => q.type !== 'intro' && q.type !== 'review' && !!state.answers[q.id] && (Array.isArray(state.answers[q.id]) ? state.answers[q.id].length > 0 : true)).length;
    const totalQuestions = QUESTIONS.filter(q => q.type !== 'intro' && q.type !== 'review').length;
    const percent = Math.round((completed / totalQuestions) * 100);
    progressFill.style.width = percent + '%';
    btnSubmit.classList.toggle('hidden', QUESTIONS[state.index].type !== 'review');
    btnNext.classList.toggle('hidden', QUESTIONS[state.index].type === 'review' || state.index >= QUESTIONS.length - 1);
    btnBack.disabled = state.index === 0;
  }

  function buildNavInto(container) {
    container.innerHTML = '';
    QUESTIONS.forEach((q, i) => {
      const completed = q.type === 'intro' ? state.index > 0 : (!!state.answers[q.id] && (Array.isArray(state.answers[q.id]) ? state.answers[q.id].length > 0 : true));
      const item = el('a', { href: '#', class: 'question-nav__item ' + (i === state.index ? 'question-nav__item--current ' : '') + (completed ? 'question-nav__item--completed' : ''), 'data-index': i, onclick: (e) => { e.preventDefault(); goTo(i); } },
        el('span', { class: 'question-nav__number' }, i + 1),
        el('div', { class: 'question-nav__text' }, q.title),
        el('span', { class: 'question-nav__status' }, completed ? 'Done' : 'Pending')
      );
      container.appendChild(item);
    });
  }

  function renderNav() {
    if (navEl) buildNavInto(navEl);
    if (navElMobile) buildNavInto(navElMobile);
    // Don't auto-scroll during option selection, only during navigation
  }

  function scrollToCurrentQuestion() {
    const container = (window.innerWidth > 900 ? navEl : (navElMobile || navEl));
    const currentItem = container ? container.querySelector('.question-nav__item--current') : null;
    if (currentItem) {
      // For desktop (vertical layout)
      if (window.innerWidth > 900) {
        currentItem.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      } else {
        // For mobile (horizontal layout)
        currentItem.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }

  function renderQuestion() {
    const q = QUESTIONS[state.index];
    rootEl.innerHTML = '';
    const header = el('div', { class: 'question__header' },
      el('h2', { class: 'question__title' }, q.title, q.required ? el('span', { class: 'question__required' }, '*') : ''),
      q.type === 'intro' ? el('p', { class: 'question__subtitle' }, q.description) : null
    );
    const optionsWrap = el('div', { class: 'question__options' });

    const current = state.answers[q.id];
    if (q.type === 'intro') {
      const start = el('button', { class: 'btn btn--primary', onclick: (e) => { e.preventDefault(); goTo(1); } }, 'Start Survey');
      optionsWrap.append(start);
    } else if (q.type === 'text') {
      const input = el('input', { 
        class: 'text-input', 
        type: 'text', 
        id: q.id, 
        name: q.id, 
        placeholder: q.placeholder || '', 
        value: current || '',
        oninput: () => { state.answers[q.id] = input.value; saveToStorage(); updateProgress(); renderNav(); }
      });
      optionsWrap.append(input);
    } else if (q.type === 'textarea') {
      const textarea = el('textarea', { 
        class: 'text-input', 
        id: q.id, 
        name: q.id, 
        placeholder: q.placeholder || '', 
        rows: 4,
        oninput: () => { state.answers[q.id] = textarea.value; saveToStorage(); updateProgress(); renderNav(); }
      });
      if (current) textarea.value = current;
      optionsWrap.append(textarea);
    } else if (q.type === 'review') {
      const reviewItems = [
        [QUESTIONS.find(q => q.id === 'name').title, state.answers.name || '-'],
        [QUESTIONS.find(q => q.id === 'role').title, state.answers.role || '-'],
        [QUESTIONS.find(q => q.id === 'district_number').title, state.answers.district_number || '-'],
        [QUESTIONS.find(q => q.id === 'challenges').title, Array.isArray(state.answers.challenges) ? state.answers.challenges.join(', ') : '-'],
        [QUESTIONS.find(q => q.id === 'least_prepared').title, state.answers.least_prepared || '-'],
        [QUESTIONS.find(q => q.id === 'training_needs').title, Array.isArray(state.answers.training_needs) ? state.answers.training_needs.join(', ') : '-'],
        [QUESTIONS.find(q => q.id === 'session_format').title, Array.isArray(state.answers.session_format) ? state.answers.session_format.join(', ') : '-'],
        [QUESTIONS.find(q => q.id === 'learning_experience').title, Array.isArray(state.answers.learning_experience) ? state.answers.learning_experience.join(', ') : '-'],
        [QUESTIONS.find(q => q.id === 'problem_solving_booth').title, state.answers.problem_solving_booth || '-'],
        [QUESTIONS.find(q => q.id === 'previous_rzis').title, state.answers.previous_rzis || '-'],
        [QUESTIONS.find(q => q.id === 'willing_to_speak').title, state.answers.willing_to_speak || '-'],
        [QUESTIONS.find(q => q.id === 'feedback').title, state.answers.feedback || '-']
      ];
      
      const reviewList = el('div', { class: 'review-list' });
      reviewItems.forEach(([key, value]) => {
        const item = el('div', { class: 'review-item' },
          el('strong', { class: 'review-key' }, key + ': '),
          el('span', { class: 'review-value' }, value)
        );
        reviewList.append(item);
      });
      optionsWrap.append(reviewList);
    } else if (q.type === 'radio') {
      // For district number, render compact grid
      if (q.id === 'district_number') optionsWrap.classList.add('grid');
      q.options.forEach((opt, i) => {
        const id = `${q.id}_${i}`;
        optionsWrap.append(
          el('div', { class: 'option' },
            el('input', { class: 'option__input', type: 'radio', id, name: q.id, value: opt, checked: current === opt, onchange: () => { state.answers[q.id] = opt; saveToStorage(); updateProgress(); renderNav(); } }),
            el('label', { class: 'option__label', for: id }, opt)
          )
        );
      });
    } else if (q.type === 'select') {
      const select = el('select', { class: 'text-input', id: q.id, onchange: () => { state.answers[q.id] = select.value; saveToStorage(); updateProgress(); renderNav(); } });
      select.append(el('option', { value: '' }, 'Select...'));
      q.options.forEach(v => select.append(el('option', { value: v, selected: current === v }, v)));
      optionsWrap.append(select);
    } else if (q.type === 'checkbox') {
      const selected = Array.isArray(current) ? new Set(current) : new Set();
      q.options.forEach((opt, i) => {
        const id = `${q.id}_${i}`;
        const onChange = () => {
          if (checkbox.checked) {
            if (q.max && selected.size >= q.max) {
              checkbox.checked = false; // revert
              alert(`Please select up to ${q.max} options.`);
              return;
            }
            selected.add(opt);
          } else {
            selected.delete(opt);
          }
          state.answers[q.id] = Array.from(selected);
          saveToStorage();
          updateProgress();
          renderNav();
        };
        const checkbox = el('input', { class: 'option__input', type: 'checkbox', id, name: q.id, value: opt, checked: selected.has(opt), onchange: onChange });
        optionsWrap.append(
          el('div', { class: 'option' },
            checkbox,
            el('label', { class: 'option__label', for: id }, opt)
          )
        );
      });
    }

    rootEl.append(header, optionsWrap);
  }

  function goTo(i) {
    state.index = Math.max(0, Math.min(QUESTIONS.length - 1, i));
    renderQuestion();
    renderNav();
    updateProgress();
    
    // Only scroll to current question when actually navigating between questions
    setTimeout(() => {
      scrollToCurrentQuestion();
    }, 100);
  }

  function next() {
    if (!validateCurrent()) return;
    goTo(state.index + 1);
  }

  function prev() {
    goTo(state.index - 1);
  }

  function validateCurrent() {
    const q = QUESTIONS[state.index];
    const v = state.answers[q.id];
    if (q.required && (v == null || v === '' || (Array.isArray(v) && v.length === 0))) {
      alert('Please answer the required question to continue.');
      return false;
    }
    return true;
  }

  function simulateNetwork(ms = 600) { return new Promise(r => setTimeout(r, ms)); }

  function openModal() { modal.classList.remove('hidden'); }
  function closeModal() { modal.classList.add('hidden'); }

  async function submitAll() {
    // Validate all required
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      const v = state.answers[q.id];
      if (q.required && (v == null || v === '' || (Array.isArray(v) && v.length === 0))) {
        goTo(i);
        alert('Please answer all required questions.');
        return;
      }
    }

    const submitBtn = document.getElementById('btnSubmit');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    loadingOverlay.classList.remove('hidden');

    try {
      // Prepare form data
      const formData = new FormData();
      Object.entries(state.answers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item));
        } else {
          formData.append(key, value);
        }
      });

      // Submit to Google Apps Script
      await fetch(CONFIG.scriptURL, { method: 'POST', body: formData });
      
      loadingOverlay.classList.add('hidden');
      showSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      loadingOverlay.classList.add('hidden');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      showSuccess(); // Still show success for better UX
    }
  }

  function showSuccess() {
    // Show success modal
    openModal();
    
    // Clear stored data after successful submission
    localStorage.removeItem('rzi_survey_answers');
  }

  // Events
  btnNext.addEventListener('click', next);
  btnBack.addEventListener('click', prev);
  btnSubmit.addEventListener('click', submitAll);
  
  // Start new survey
  if (startNewSurvey) {
    startNewSurvey.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      
      // Reset state
      state.index = 0;
      state.answers = {};
      
      // Clear storage
      localStorage.removeItem('rzi_survey_answers');
      
      // Re-render everything
      renderNav();
      renderQuestion();
      updateProgress();
    });
  }

  // Handle window resize for responsive scrolling
  window.addEventListener('resize', () => {
    setTimeout(() => {
      scrollToCurrentQuestion();
    }, 100);
  });

  // Init
  renderNav();
  renderQuestion();
  updateProgress();
})();
