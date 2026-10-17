/* ==========================================================
   Настройки — заполнить перед запуском
   ========================================================== */
const CONFIG = {
  // URL для приёма заявок (POST, JSON). Подойдёт Formspree, Getform,
  // свой воркер с отправкой в Telegram-бота и т.п.
  // Пока пусто — заявка копируется и предлагается отправить её в Telegram.
  endpoint: '',
  telegram: 'USERNAME',     // ник в Telegram без @
  phone: '+79000000000',    // телефон в международном формате
};

/* ---------- Шапка: тень при скролле ---------- */
const header = document.querySelector('[data-header]');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Мобильное меню ---------- */
const burger = document.querySelector('[data-burger]');
const nav = document.querySelector('[data-nav]');

const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('is-open', open);
};

burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', (e) => {
  if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
});

/* ---------- Появление блоков ---------- */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  // Лёгкая «лесенка» для соседних элементов
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

/* ---------- Мобильная CTA: показываем после первого экрана, прячем у формы ---------- */
const mobileCta = document.querySelector('[data-mobile-cta]');
const hero = document.querySelector('.hero');
const signup = document.querySelector('#signup');
if ('IntersectionObserver' in window) {
  const state = { hero: true, signup: false };
  const update = () => {
    const visible = !state.hero && !state.signup;
    mobileCta.classList.toggle('is-visible', visible);
    mobileCta.setAttribute('aria-hidden', String(!visible));
    mobileCta.querySelector('a').tabIndex = visible ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { state.hero = e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { state.signup = e.isIntersecting; update(); }).observe(signup);
}

/* ---------- Контакты из CONFIG ---------- */
const tgUrl = `https://t.me/${CONFIG.telegram}`;
document.querySelectorAll('[data-contact="telegram"], [data-fallback-link]').forEach((a) => { a.href = tgUrl; });
document.querySelectorAll('[data-contact="phone"]').forEach((a) => { a.href = `tel:${CONFIG.phone}`; });

/* ---------- Кнопки тарифов подставляют класс в форму ---------- */
const form = document.querySelector('#lead-form');
const gradeSelect = form.elements.grade;
document.querySelectorAll('[data-grade]').forEach((btn) => {
  btn.addEventListener('click', () => {
    gradeSelect.value = btn.dataset.grade;
    gradeSelect.closest('.field').classList.remove('is-invalid');
  });
});

/* ---------- Форма заявки ---------- */
const status = form.querySelector('.form__status');
const submitBtn = form.querySelector('[type="submit"]');
const success = document.querySelector('.form-success');
const fallback = document.querySelector('.form-fallback');

const isValidContact = (value) => {
  const v = value.trim();
  if (/^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(v)) return true;      // ник Telegram
  return v.replace(/\D/g, '').length >= 10;                        // телефон
};

const validators = {
  name: (v) => v.trim().length >= 2,
  contact: isValidContact,
  grade: (v) => v !== '',
};

const validateField = (input) => {
  const check = validators[input.name];
  if (!check) return true;
  const ok = check(input.value);
  input.closest('.field').classList.toggle('is-invalid', !ok);
  input.setAttribute('aria-invalid', String(!ok));
  return ok;
};

Object.keys(validators).forEach((name) => {
  const input = form.elements[name];
  input.addEventListener('blur', () => { if (input.value) validateField(input); });
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
  });
  input.addEventListener('change', () => validateField(input));
});

form.elements.consent.addEventListener('change', (e) => {
  e.target.closest('.consent').classList.toggle('is-invalid', !e.target.checked);
});

const buildMessage = (data) => [
  'Здравствуйте! Хочу записаться на бесплатное пробное занятие.',
  `Имя: ${data.name}`,
  `Контакт: ${data.contact}`,
  `Класс и цель: ${data.grade}`,
  data.comment ? `Комментарий: ${data.comment}` : '',
].filter(Boolean).join('\n');

const showPanel = (panel) => {
  form.hidden = true;
  panel.hidden = false;
  panel.focus();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';

  const fieldsOk = Object.keys(validators).map((n) => validateField(form.elements[n])).every(Boolean);
  const consent = form.elements.consent;
  consent.closest('.consent').classList.toggle('is-invalid', !consent.checked);

  if (!fieldsOk || !consent.checked) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]') || (!consent.checked && consent);
    firstInvalid?.focus();
    if (fieldsOk && !consent.checked) status.textContent = 'Подтвердите согласие на обработку данных';
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  data.comment = (data.comment || '').trim();

  if (!CONFIG.endpoint) {
    const text = buildMessage(data);
    form.closest('.signup__form-wrap').querySelector('[data-fallback-text]').textContent = text;
    try { await navigator.clipboard.writeText(text); } catch { /* буфер недоступен — текст виден на экране */ }
    showPanel(fallback);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем…';
  try {
    const res = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, page: location.href }),
    });
    if (!res.ok) throw new Error(res.statusText);
    form.reset();
    showPanel(success);
  } catch {
    status.textContent = `Не удалось отправить заявку. Напишите мне в Telegram: @${CONFIG.telegram}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Записаться бесплатно';
  }
});

/* ---------- Год в подвале ---------- */
document.querySelector('[data-year]').textContent = new Date().getFullYear();
