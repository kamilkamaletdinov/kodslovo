/* ===========================================================
   КОД&СЛОВО — Demo landing interactions
   =========================================================== */
(function () {
  'use strict';

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state + progress ---------- */
  var header = document.getElementById('header');
  var progress = document.getElementById('scrollProgress');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('is-scrolled', y > 20);

    if (progress) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger siblings slightly
          var delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      // small automatic stagger within groups
      el.dataset.delay = String((i % 4) * 70);
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var duration = 1400;
    var start = performance.now();

    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* ---------- Hero chat demo ---------- */
  var chat = document.getElementById('chat');

  var botReplies = {
    'Нужен Telegram-бот': 'Отлично! Бот для записи, заявок или продаж? Сделаю за 3 дня. Оставьте контакт — покажу демо.',
    'Нужен сайт': 'Сделаю лендинг с продающим текстом за 3–5 дней. Расскажите, для какой сферы — предложу структуру.',
    'Нужны тексты': 'Пишу продающие тексты для сайта, бота и рекламы. Пришлите пару примеров — сделаю пробный фрагмент.'
  };

  function addMessage(text, isUser) {
    if (!chat) return;

    var msg = document.createElement('div');
    msg.className = 'msg ' + (isUser ? 'msg--user' : 'msg--bot');
    var p = document.createElement('p');
    p.textContent = text;
    msg.appendChild(p);
    chat.appendChild(msg);

    // keep only last 6 messages
    while (chat.children.length > 6) chat.removeChild(chat.firstChild);

    // scroll chat into view internally if needed
    chat.scrollTop = chat.scrollHeight;
  }

  if (chat) {
    chat.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;

      var reply = chip.dataset.reply;
      addMessage(reply, true);

      var options = chat.querySelector('.chat__options');
      if (options) options.remove();

      setTimeout(function () {
        addMessage(botReplies[reply] || 'Принято! Напишите свой контакт — свяжусь и всё обсудим.', false);
      }, 700);
    });
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    var answer = item.querySelector('.faq__a');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // close all
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var a = other.querySelector('.faq__a');
        if (a) a.style.maxHeight = null;
      });

      // open clicked
      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contactForm');
  var toast = document.getElementById('toast');

  function showToast(text) {
    if (!toast) return;
    var textEl = toast.querySelector('.toast__text');
    if (textEl && text) textEl.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4200);
  }

  function setError(field, message) {
    field.classList.add('has-error');
    var err = field.querySelector('.field__error');
    if (err) err.textContent = message;
  }

  function clearError(field) {
    field.classList.remove('has-error');
    var err = field.querySelector('.field__error');
    if (err) err.textContent = '';
  }

  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) clearError(field);
      });
      input.addEventListener('change', function () {
        var field = input.closest('.field');
        if (field) clearError(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var required = ['name', 'contact', 'task'];

      required.forEach(function (id) {
        var input = document.getElementById(id);
        if (!input) return;
        var field = input.closest('.field');
        if (!input.value.trim()) {
          setError(field, 'Пожалуйста, заполните это поле');
          valid = false;
        } else {
          clearError(field);
        }
      });

      // simple contact check
      var contactInput = document.getElementById('contact');
      if (contactInput && contactInput.value.trim()) {
        var val = contactInput.value.trim();
        var looksLikeContact = /@|^\+?[\d\s\-()]{7,}$/.test(val);
        if (!looksLikeContact) {
          setError(contactInput.closest('.field'), 'Укажите телефон или @username');
          valid = false;
        }
      }

      if (!valid) {
        var firstError = form.querySelector('.has-error input, .has-error select');
        if (firstError) firstError.focus();
        return;
      }

      // Demo: no backend. Simulate success.
      var submitBtn = form.querySelector('button[type="submit"]');
      var original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем…';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
        form.reset();
        showToast('Заявка отправлена! Свяжусь с вами в течение дня.');
      }, 900);
    });
  }

  /* ---------- Smooth anchor scroll with header offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      var headerH = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
