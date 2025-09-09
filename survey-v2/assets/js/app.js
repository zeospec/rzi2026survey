/* RZI Survey App - Dynamic Renderer with Progress, Storage and Submit */
(function() {
  const QUESTIONS = [
    {
      id: 'intro',
      title: 'Overview',
      type: 'intro',
      description: 'To ensure RZI 2026 in Namma Chennai is impactful, relevant, and focused on real-time district-level challenges, we\'re collecting inputs from Rotaract leaders like you. This quick survey will help design training, panels, and resources tailored to your needs.'
    },
    {
      id: 'role',
      title: 'Your current role in Rotaract',
      type: 'radio',
      required: true,
      options: ['Immediate Past DRR','Current DRR','DRR Elect']
    },
    {
      id: 'district_number',
      title: 'Your District Number',
      type: 'select',
      required: true,
      options: ['3011','3012','3020']
    },
    {
      id: 'challenges',
      title: 'Top challenges in your term (choose up to 3)',
      type: 'checkbox',
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
      title: 'Area DRRs are least prepared for at the start of term',
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
      title: 'Areas needing focused training at RZI',
      type: 'checkbox',
      options: [
        'Conflict resolution & people management',
        'Building your core team',
        'How to build & run district-wide projects',
        'Fundraising & CSR connects',
        'Data handling & reporting',
        'Effective Rotary-Rotaract synergy',
        'Membership growth & club health',
        'Digital branding tools',
        'Planning GRMs, Conferences, RYLAs',
        'How to handover effectively to your DRRE'
      ]
    },
    {
      id: 'session_format',
      title: 'Preferred session format at RZI',
      type: 'checkbox',
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
      title: 'Learning experience you value most at RZI',
      type: 'radio',
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
      title: 'Value in a Problem Solving Booth at RZI',
      type: 'radio',
      required: true,
      options: ['Yes','Maybe','Not really']
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
      title: 'Willing to be a panelist/speaker if invited?',
      type: 'radio',
      required: true,
      options: ['Yes','Maybe','No']
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
  const rootEl = document.getElementById('questionRoot');
  const progressFill = document.getElementById('progressFill');
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnSave = document.getElementById('btnSave');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const modal = document.getElementById('successModal');
  const downloadJson = document.getElementById('downloadJson');

  function loadFromStorage() {
    try { return JSON.parse(localStorage.getItem('rzi_survey_answers') || '{}'); } catch { return {}; }
  }
  function saveToStorage() {
    localStorage.setItem('rzi_survey_answers', JSON.stringify(state.answers));
  }

  function updateProgress() {
    const completed = QUESTIONS.filter(q => !!state.answers[q.id] && (Array.isArray(state.answers[q.id]) ? state.answers[q.id].length > 0 : true)).length;
    const percent = Math.round((completed / QUESTIONS.length) * 100);
    progressFill.style.width = percent + '%';
    btnSubmit.classList.toggle('hidden', state.index < QUESTIONS.length - 1);
    btnNext.classList.toggle('hidden', state.index >= QUESTIONS.length - 1);
    btnBack.disabled = state.index === 0;
  }

  function renderNav() {
    navEl.innerHTML = '';
    QUESTIONS.forEach((q, i) => {
      const completed = q.type === 'intro' ? state.index > 0 : (!!state.answers[q.id] && (Array.isArray(state.answers[q.id]) ? state.answers[q.id].length > 0 : true));
      const item = el('a', { href: '#', class: 'question-nav__item ' + (i === state.index ? 'question-nav__item--current ' : '') + (completed ? 'question-nav__item--completed' : ''), 'data-index': i, onclick: (e) => { e.preventDefault(); goTo(i); } },
        el('span', { class: 'question-nav__number' }, i + 1),
        el('div', { class: 'question-nav__text' }, q.title),
        el('span', { class: 'question-nav__status' }, completed ? 'Done' : 'Pending')
      );
      navEl.appendChild(item);
    });
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
    } else if (q.type === 'radio') {
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
      select.append(el('option', { value: '', disabled: true, selected: !current }, 'Select your district'));
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

  async function saveNow() {
    loadingOverlay.classList.remove('hidden');
    await simulateNetwork();
    saveToStorage();
    loadingOverlay.classList.add('hidden');
  }

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

    loadingOverlay.classList.remove('hidden');
    await simulateNetwork(900);
    loadingOverlay.classList.add('hidden');

    // Download responses and show success
    const blob = new Blob([JSON.stringify(state.answers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadJson.href = url;
    openModal();
  }

  // Events
  btnNext.addEventListener('click', next);
  btnBack.addEventListener('click', prev);
  btnSave.addEventListener('click', saveNow);
  btnSubmit.addEventListener('click', submitAll);
  modal.addEventListener('click', (e) => { if (e.target.dataset.close === 'modal' || e.target.closest('[data-close="modal"]')) closeModal(); });

  // Init
  renderNav();
  renderQuestion();
  updateProgress();
})();
