/**
 * LaptopFix Bishkek — client-side scripts.
 *
 * CONTACTS is the single source of truth for contact details across the
 * page (header, footer, future #contacts section). Values below are
 * PLACEHOLDERS — replace them with real data before launch.
 */
const CONTACTS = {
  phone: '+996 700 000 000',
  phoneHref: 'tel:+996700000000',
  whatsappHref: 'https://wa.me/996700000000',
  telegramHref: 'https://t.me/laptopfix_bishkek',
  address: 'Бишкек, выезд по городу (адрес мастерской уточняется)',
  hours: 'Ежедневно, 09:00–20:00',
};

/**
 * Fills every element marked with data-contact-* attributes using the
 * CONTACTS object, so contact info only ever needs to be edited in one
 * place.
 */
function applyContacts() {
  document.querySelectorAll('[data-contact-phone-href]').forEach((el) => {
    el.setAttribute('href', CONTACTS.phoneHref);
  });
  document.querySelectorAll('[data-contact-phone]').forEach((el) => {
    el.textContent = CONTACTS.phone;
  });
  document.querySelectorAll('[data-contact-whatsapp-href]').forEach((el) => {
    el.setAttribute('href', CONTACTS.whatsappHref);
  });
  document.querySelectorAll('[data-contact-telegram-href]').forEach((el) => {
    el.setAttribute('href', CONTACTS.telegramHref);
  });
  document.querySelectorAll('[data-contact-address]').forEach((el) => {
    el.textContent = CONTACTS.address;
  });
  document.querySelectorAll('[data-contact-hours]').forEach((el) => {
    el.textContent = CONTACTS.hours;
  });
}

/**
 * Smooth-scrolls to in-page anchors, accounting for the fixed header
 * height. Falls back silently if the target does not exist yet (some
 * sections are added by later tasks).
 */
function initSmoothScroll() {
  const header = document.querySelector('header');

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        closeMobileMenu();
      }
    });
  });
}

function openMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  if (!toggle || !menu) return;

  menu.classList.remove('hidden');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Закрыть меню');
  iconOpen && iconOpen.classList.add('hidden');
  iconClose && iconClose.classList.remove('hidden');
}

function closeMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  if (!toggle || !menu) return;

  menu.classList.add('hidden');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Открыть меню');
  iconOpen && iconOpen.classList.remove('hidden');
  iconClose && iconClose.classList.add('hidden');
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close mobile menu automatically when resizing up to desktop breakpoint.
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });
}

function setFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

/**
 * Request form (#request): client-side validation, submit via fetch to
 * POST /api/requests (see .team/brief.md, "API-контракты") and three UI
 * states — sending / success / error. Matches the server-side phone regex
 * from BE-01: ^(\+996|0)\d{9}$.
 */
const REQUEST_PHONE_PATTERN = /^(\+996\d{9}|0\d{9})$/;

/**
 * Shows or clears an inline error message for a single form field and
 * toggles aria-invalid / the .has-error styling hook.
 */
function setFieldError(fieldId, message) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
  }

  if (inputEl) {
    const fieldWrapper = inputEl.closest('.field');
    if (fieldWrapper) {
      fieldWrapper.classList.toggle('has-error', Boolean(message));
    }
    if (message) {
      inputEl.setAttribute('aria-invalid', 'true');
    } else {
      inputEl.removeAttribute('aria-invalid');
    }
  }
}

/**
 * Validates the request form payload. Returns a map of fieldId -> message
 * for every invalid field (empty map = valid).
 */
function validateRequestForm(data) {
  const errors = {};

  if (!data.name.trim()) {
    errors['request-name'] = 'Укажите ваше имя.';
  }

  const phone = data.phone.trim();
  if (!phone) {
    errors['request-phone'] = 'Укажите номер телефона.';
  } else if (!REQUEST_PHONE_PATTERN.test(phone)) {
    errors['request-phone'] = 'Формат номера: +996XXXXXXXXX или 0XXXXXXXXX.';
  }

  if (!data.problem.trim()) {
    errors['request-problem'] = 'Опишите проблему хотя бы в двух словах.';
  }

  return errors;
}

function setRequestFormLoading(isLoading) {
  const submitButton = document.getElementById('request-submit');
  const submitLabel = document.getElementById('request-submit-label');
  if (!submitButton || !submitLabel) return;

  submitButton.disabled = isLoading;
  submitLabel.textContent = isLoading ? 'Отправка…' : 'Отправить заявку';
}

function setRequestFormStatus(message, type) {
  const statusEl = document.getElementById('request-status');
  if (!statusEl) return;

  statusEl.textContent = message || '';
  statusEl.classList.remove('form-status--success', 'form-status--error');
  if (type === 'success') {
    statusEl.classList.add('form-status--success');
  } else if (type === 'error') {
    statusEl.classList.add('form-status--error');
  }
}

function initRequestForm() {
  const form = document.getElementById('request-form');
  if (!form) return;

  const fieldIds = ['request-name', 'request-phone', 'request-problem'];

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = {
      name: form.elements.name.value,
      phone: form.elements.phone.value,
      model: form.elements.model.value,
      problem: form.elements.problem.value,
    };

    fieldIds.forEach((id) => setFieldError(id, ''));
    setRequestFormStatus('', null);

    const errors = validateRequestForm(data);
    const invalidIds = Object.keys(errors);
    if (invalidIds.length > 0) {
      invalidIds.forEach((id) => setFieldError(id, errors[id]));
      const firstInvalidField = document.getElementById(invalidIds[0]);
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    setRequestFormLoading(true);

    const trimmed = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      model: data.model.trim(),
      problem: data.problem.trim(),
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmed),
      });

      let result = null;
      try {
        result = await response.json();
      } catch (parseError) {
        result = null;
      }

      if (response.ok && result && result.ok) {
        setRequestFormStatus('Заявка отправлена, я свяжусь с вами в ближайшее время.', 'success');
        form.reset();
      } else {
        const errorMessage =
          (result && result.error) ||
          'Не удалось отправить заявку. Попробуйте ещё раз или позвоните напрямую.';
        setRequestFormStatus(errorMessage, 'error');
      }
    } catch (networkError) {
      // /api/requests is unreachable — typical for a static Netlify deploy
      // without the self-hosted Express backend running. Fall back to a
      // native Netlify Forms submission instead of showing a network error.
      await submitViaNetlifyForms(form, trimmed);
    } finally {
      setRequestFormLoading(false);
    }
  });
}

/**
 * Fallback path for static Netlify deploys: submits the request form data
 * as a standard Netlify Forms POST to "/" (the form is pre-rendered in the
 * static HTML with data-netlify="true" so Netlify's build-time scanner
 * picks it up). Used only when POST /api/requests fails with a network
 * error, i.e. no self-hosted Express backend is available.
 */
async function submitViaNetlifyForms(form, data) {
  try {
    const netlifyResponse = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'request',
        name: data.name,
        phone: data.phone,
        model: data.model,
        problem: data.problem,
      }).toString(),
    });

    if (netlifyResponse.ok) {
      setRequestFormStatus('Заявка отправлена, я свяжусь с вами в ближайшее время.', 'success');
      form.reset();
    } else {
      setRequestFormStatus(
        'Нет соединения с сервером. Проверьте интернет и попробуйте снова или позвоните напрямую.',
        'error'
      );
    }
  } catch (netlifyError) {
    setRequestFormStatus(
      'Нет соединения с сервером. Проверьте интернет и попробуйте снова или позвоните напрямую.',
      'error'
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyContacts();
  initSmoothScroll();
  initMobileMenu();
  setFooterYear();
  initRequestForm();
});
