/* ==========================================================================
   SMELLTEST — Shared script (CSC 106 / IFT 203)
   Requirement #8: JavaScript on every page.
   Each page calls its own init() from the PAGE MODULES block at the bottom.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Small helpers ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, evt, fn, opts) => el && el.addEventListener(evt, fn, opts);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const storage = {
    read(key) {
      try { return JSON.parse(localStorage.getItem(key)) || []; }
      catch (err) { return []; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (err) { return false; }
    }
  };

  /* ---------- 1. Mobile navigation ---------- */
  function initNav() {
    const toggle = $(".nav-toggle");
    const nav = $("#site-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };

    on(toggle, "click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close the menu after choosing a destination.
    $$("a", nav).forEach((link) => on(link, "click", () => setOpen(false)));

    // Close on Escape, or when the viewport grows past the breakpoint.
    on(document, "keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
    on(window, "resize", () => {
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  /* ---------- 2. Marquee: pause while hovered / focused ---------- */
  function initTicker() {
    const marquee = $(".ticker marquee");
    if (!marquee) return;

    const baseSpeed = Number(marquee.getAttribute("scrollamount")) || 6;
    const ticker = $(".ticker");

    const pause = () => marquee.setAttribute("scrollamount", "0");
    const resume = () => marquee.setAttribute("scrollamount", String(baseSpeed));

    on(ticker, "mouseenter", pause);
    on(ticker, "mouseleave", resume);
    on(ticker, "focusin", pause);
    on(ticker, "focusout", resume);
  }

  /* ---------- 3. Scroll reveal ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add("is-visible"), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    items.forEach((el) => observer.observe(el));
  }

  /* ---------- 4. Footer year + back to top ---------- */
  function initChrome() {
    $$("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });

    const btn = $(".to-top");
    if (!btn) return;

    const update = () => btn.classList.toggle("is-visible", window.scrollY > 520);
    on(window, "scroll", update, { passive: true });
    update();

    on(btn, "click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 5. Animated number counters (Home) ---------- */
  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;

    const run = (el) => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1300;
      const start = performance.now();

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString() + suffix;
        return;
      }

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => obs.observe(el));
  }

  /* ---------- 6. Shopping bag (works on every page) ---------- */
  const BAG_KEY = "bt_bag";
  const money = (n) => "\u20A6" + Number(n).toLocaleString("en-NG");

  const bag = {
    read() {
      try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; }
      catch (err) { return []; }
    },
    write(items) {
      try { localStorage.setItem(BAG_KEY, JSON.stringify(items)); return true; }
      catch (err) { return false; }
    },
    add(item) {
      const items = bag.read();
      const found = items.find((i) => i.id === item.id);
      if (found) found.qty += 1;
      else items.push(Object.assign({ qty: 1 }, item));
      bag.write(items);
    },
    setQty(id, qty) {
      const items = bag.read()
        .map((i) => (i.id === id ? Object.assign({}, i, { qty: qty }) : i))
        .filter((i) => i.qty > 0);
      bag.write(items);
    },
    remove(id) {
      bag.write(bag.read().filter((i) => i.id !== id));
    },
    count() { return bag.read().reduce((sum, i) => sum + i.qty, 0); },
    total() { return bag.read().reduce((sum, i) => sum + i.qty * i.price, 0); }
  };

  function renderBag() {
    const countEl = $("#bag-count");
    const itemsEl = $("#bag-items");
    const totalEl = $("#bag-total");
    const items = bag.read();

    if (countEl) {
      const count = bag.count();
      countEl.textContent = String(count);
      countEl.classList.toggle("is-zero", count === 0);
    }
    if (!itemsEl || !totalEl) return;

    totalEl.textContent = money(bag.total());

    if (!items.length) {
      itemsEl.innerHTML = '<li class="bag__empty">Your bag is empty. Explore the fragrances to begin.</li>';
      return;
    }

    itemsEl.innerHTML = items.map((item) => `
      <li class="bag-item">
        <span class="bag-item__media"><img src="${item.image}" alt="" width="58" height="76"></span>
        <span>
          <span class="bag-item__name">${item.name}</span>
          <span class="bag-item__meta">${item.size} · ${money(item.price)}</span>
          <span class="qty">
            <button type="button" data-act="dec" data-id="${item.id}" aria-label="Decrease quantity of ${item.name}">&minus;</button>
            <span aria-live="polite">${item.qty}</span>
            <button type="button" data-act="inc" data-id="${item.id}" aria-label="Increase quantity of ${item.name}">+</button>
          </span>
        </span>
        <span class="bag-item__right">
          <span class="bag-item__price">${money(item.price * item.qty)}</span>
          <button class="bag-item__remove" type="button" data-act="remove" data-id="${item.id}">Remove</button>
        </span>
      </li>`).join("");
  }

  function initBag() {
    const panel = $("#bag");
    const toggle = $("#bag-toggle");
    if (!panel || !toggle) return;

    const open = () => {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("modal-open");
      const close = $(".bag__close", panel);
      if (close) close.focus();
    };

    const close = () => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("modal-open");
      toggle.focus();
    };

    on(toggle, "click", () => {
      if (panel.classList.contains("is-open")) close();
      else open();
    });

    $$("[data-bag-close]", panel).forEach((el) => on(el, "click", close));
    on(document, "keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });

    on($("#bag-items"), "click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const id = btn.dataset.id;
      const current = bag.read().find((i) => i.id === id);
      const qty = current ? current.qty : 0;

      if (btn.dataset.act === "inc") bag.setQty(id, qty + 1);
      if (btn.dataset.act === "dec") bag.setQty(id, qty - 1);
      if (btn.dataset.act === "remove") bag.remove(id);
      renderBag();
    });

    on($("#bag-checkout"), "click", () => {
      const status = $("#bag-status");
      if (!bag.read().length) {
        showStatus(status, "Your bag is empty.", "Add a fragrance before checking out.", true);
        return;
      }
      const ref = "BT-" + String(Date.now()).slice(-6);
      showStatus(status, "Order placed (demo).",
        `Reference <strong>${ref}</strong>. Total ${money(bag.total())}. ` +
        "This is a student project, so no payment was taken.");
    });

    // Expose a tiny API for the product page.
    window.btBag = { add: bag.add, open: open, render: renderBag };
    renderBag();
  }

  /* ---------- 7. Product filtering + quick view + add to bag ---------- */
  function initProducts() {
    const grid = $("#product-grid");
    if (!grid) return;

    const cards = $$(".product", grid);
    const chips = $$(".chip");
    const emptyNote = $("#products-empty");
    const countEl = $("#product-count");

    const updateCount = () => {
      const shown = cards.filter((c) => !c.hidden).length;
      if (countEl) countEl.textContent = shown + (shown === 1 ? " fragrance" : " fragrances");
    };

    chips.forEach((chip) => {
      on(chip, "click", () => {
        const filter = chip.dataset.filter;
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));

        cards.forEach((card) => {
          card.hidden = !(filter === "all" || card.dataset.category === filter);
        });

        if (emptyNote) emptyNote.hidden = cards.some((c) => !c.hidden);
        updateCount();
      });
    });

    updateCount();

    // --- Quick view modal ---
    const modal = $("#product-modal");
    if (modal) {
      const content = $(".modal__content", modal);
      const img = $(".modal__media img", modal);
      let lastFocused = null;
      let activeCard = null;

      const openModal = (card, trigger) => {
        activeCard = card;
        lastFocused = trigger;
        img.src = card.dataset.image;
        img.alt = card.dataset.name;

        content.innerHTML = `
          <span class="eyebrow">${card.dataset.categoryLabel}</span>
          <h2 id="modal-title">${card.dataset.name}</h2>
          <p class="modal__price">${card.dataset.price} <span class="modal__size">/ ${card.dataset.size}</span></p>
          <p>${card.dataset.description}</p>
          <dl class="spec-list">
            <div><dt>Notes</dt><dd>${card.dataset.notes}</dd></div>
            <div><dt>Concentration</dt><dd>${card.dataset.concentration}</dd></div>
            <div><dt>Size</dt><dd>${card.dataset.size}</dd></div>
            <div><dt>Availability</dt><dd>${card.dataset.availability}</dd></div>
          </dl>
          <div class="modal__actions">
            <button class="btn js-modal-add" type="button">Add to bag</button>
            <a class="link-arrow" href="contact.html">Book a scent consultation</a>
          </div>`;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        $(".modal__close", modal).focus();
      };

      const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        if (lastFocused) lastFocused.focus();
      };

      on(content, "click", (e) => {
        if (!e.target.closest(".js-modal-add") || !activeCard) return;
        addCardToBag(activeCard);
        closeModal();
        if (window.btBag) window.btBag.open();
      });

      cards.forEach((card) => {
        const media = $(".product__media", card);
        const view = $(".js-view", card);
        if (media) on(media, "click", () => openModal(card, media));
        if (view) on(view, "click", () => openModal(card, view));
      });

      on($(".modal__close", modal), "click", closeModal);
      on(modal, "click", (e) => { if (e.target === modal) closeModal(); });
      on(document, "keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
      });
    }

    // --- Add to bag ---
    function addCardToBag(card) {
      bag.add({
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.priceValue),
        image: card.dataset.image,
        size: card.dataset.size
      });
      renderBag();
    }

    $$(".js-add", grid).forEach((btn) => {
      on(btn, "click", () => {
        const card = btn.closest(".product");
        if (!card) return;
        addCardToBag(card);

        const original = btn.textContent;
        btn.textContent = "Added \u2713";
        btn.disabled = true;
        window.setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 1100);
      });
    });
  }

  /* ---------- 7. Trustee profile expand (keyboard friendly) ---------- */
  function initTrustees() {
    $$(".trustee").forEach((card) => {
      const more = $(".trustee__more", card);
      const extra = $(".trustee__extra", card);
      if (!more || !extra) return;

      on(more, "click", () => {
        const open = more.getAttribute("aria-expanded") !== "true";
        more.setAttribute("aria-expanded", String(open));
        more.textContent = open ? "Less" : "More";
        extra.hidden = !open;
      });
    });
  }

  /* ---------- 8. Events countdown ---------- */
  function initCountdown() {
    const el = $("#countdown");
    if (!el) return;

    const target = new Date(el.dataset.target).getTime();
    if (Number.isNaN(target)) return;

    const fields = {
      days: $("[data-unit='days']", el),
      hours: $("[data-unit='hours']", el),
      minutes: $("[data-unit='minutes']", el),
      seconds: $("[data-unit='seconds']", el)
    };
    const pad = (n) => String(n).padStart(2, "0");

    const tick = () => {
      const diff = target - Date.now();

      if (diff <= 0) {
        el.innerHTML = '<p class="countdown__label"><strong>This event has started.</strong>' +
          '<span>See the full programme below.</span></p>';
        return;
      }

      const secs = Math.floor(diff / 1000);
      fields.days.textContent    = String(Math.floor(secs / 86400));
      fields.hours.textContent   = pad(Math.floor((secs % 86400) / 3600));
      fields.minutes.textContent = pad(Math.floor((secs % 3600) / 60));
      fields.seconds.textContent = pad(secs % 60);
    };

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- 9. Contact page: validation + local storage ---------- */
  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
  const isPhone = (value) => /^[+()\d][\d\s()+-]{6,19}$/.test(value.trim());

  function setError(field, message) {
    const wrapper = field.closest(".field");
    if (!wrapper) return;
    wrapper.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");
    const slot = $(".field__error", wrapper);
    if (slot) slot.textContent = message;
  }

  function clearError(field) {
    const wrapper = field.closest(".field");
    if (!wrapper) return;
    wrapper.classList.remove("has-error");
    field.removeAttribute("aria-invalid");
  }

  function showStatus(statusEl, title, message, isError) {
    if (!statusEl) return;
    statusEl.classList.add("is-visible");
    statusEl.classList.toggle("is-error", Boolean(isError));
    statusEl.setAttribute("role", isError ? "alert" : "status");
    statusEl.innerHTML = `<strong>${title}</strong>${message}`;
  }

  function initContactForms() {
    /* ---- Inquiry form ---- */
    const inquiry = $("#inquiry-form");
    if (inquiry) {
      const status = $("#inquiry-status");

      on(inquiry, "submit", (e) => {
        e.preventDefault();

        const name = $("#inquiry-name", inquiry);
        const email = $("#inquiry-email", inquiry);
        const message = $("#inquiry-message", inquiry);
        let valid = true;
        let firstBad = null;

        [
          [name, name.value.trim().length >= 2, "Please tell us your name."],
          [email, isEmail(email.value), "Enter a valid email address, e.g. you@mail.com."],
          [message, message.value.trim().length >= 10, "Your message needs at least 10 characters."]
        ].forEach(([field, ok, msg]) => {
          if (ok) { clearError(field); return; }
          setError(field, msg);
          valid = false;
          if (!firstBad) firstBad = field;
        });

        if (!valid) {
          showStatus(status, "Almost there.", "Please correct the highlighted field" +
            ($$(".has-error", inquiry).length > 1 ? "s." : "."), true);
          firstBad.focus();
          return;
        }

        const record = {
          id: "INQ-" + Date.now().toString().slice(-6),
          name: name.value.trim(),
          email: email.value.trim(),
          subject: $("#inquiry-subject", inquiry).value,
          message: message.value.trim(),
          createdAt: new Date().toISOString()
        };
        storage.write("adire_inquiries", [record, ...storage.read("adire_inquiries")]);

        inquiry.reset();
        showStatus(status, "Message received.",
          `Thank you, ${record.name.split(" ")[0]}. Reference <strong>${record.id}</strong>. ` +
          "Our studio replies within two working days.");
      });

      // Live re-validation once a field has been touched.
      $$("input, textarea", inquiry).forEach((field) => {
        on(field, "input", () => clearError(field));
      });
    }

    /* ---- Appointment form ---- */
    const booking = $("#booking-form");
    if (booking) {
      const status = $("#booking-status");
      const dateInput = $("#booking-date", booking);

      // Appointments can only be booked from tomorrow onward.
      const toISO = (d) => d.toISOString().slice(0, 10);
      const min = new Date();
      min.setDate(min.getDate() + 1);
      dateInput.min = toISO(min);

      on(booking, "submit", (e) => {
        e.preventDefault();

        const name = $("#booking-name", booking);
        const email = $("#booking-email", booking);
        const phone = $("#booking-phone", booking);
        const service = $("#booking-service", booking);
        const date = dateInput;
        const time = $("#booking-time", booking);
        const consent = $("#booking-consent", booking);

        let valid = true;
        let firstBad = null;

        const checks = [
          [name, name.value.trim().length >= 2, "Please enter your full name."],
          [email, isEmail(email.value), "Enter a valid email address."],
          [phone, isPhone(phone.value), "Enter a reachable phone number."],
          [service, service.value !== "", "Choose the service you need."],
          [date, date.value !== "" && date.value >= date.min, "Pick a date from tomorrow onward."],
          [time, time.value !== "", "Choose a preferred time."]
        ];

        checks.forEach(([field, ok, msg]) => {
          if (ok) { clearError(field); return; }
          setError(field, msg);
          valid = false;
          if (!firstBad) firstBad = field;
        });

        if (!consent.checked) {
          valid = false;
          if (!firstBad) firstBad = consent;
        }

        if (!valid) {
          showStatus(status, "Check your details.",
            consent.checked
              ? "Some required fields need attention."
              : "Please accept the appointment policy to continue.", true);
          if (firstBad && typeof firstBad.focus === "function") firstBad.focus();
          return;
        }

        const record = {
          id: "APT-" + Date.now().toString().slice(-6),
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          service: service.value,
          date: date.value,
          time: time.value,
          notes: $("#booking-notes", booking).value.trim(),
          createdAt: new Date().toISOString()
        };

        storage.write("adire_appointments", [record, ...storage.read("adire_appointments")]);

        const prettyDate = new Date(record.date + "T00:00:00")
          .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

        booking.reset();
        dateInput.min = toISO(min);
        renderBookings();

        showStatus(status, "Appointment requested.",
          `${record.name.split(" ")[0]}, we have pencilled you in for <strong>${prettyDate}</strong> at ` +
          `<strong>${record.time}</strong> (${record.service}). Reference <strong>${record.id}</strong>. ` +
          "A stylist will confirm by email within 24 hours.");
      });

      $$("input, select, textarea", booking).forEach((field) => {
        on(field, "input", () => clearError(field));
        on(field, "change", () => clearError(field));
      });
    }

    /* ---- Saved appointment summary ---- */
    const list = $("#booking-list");
    if (!list) return;

    function renderBookings() {
      const records = storage.read("adire_appointments").slice(0, 4);
      list.innerHTML = "";

      if (!records.length) {
        list.innerHTML = '<li class="empty-note" style="padding:1.4rem 0;text-align:left">' +
          "No appointments saved yet. Your requests will appear here.</li>";
        return;
      }

      records.forEach((r) => {
        const li = document.createElement("li");
        li.className = "booking-item";
        const left = document.createElement("span");
        left.textContent = `${r.service} · ${r.date} at ${r.time}`;
        const right = document.createElement("span");
        right.textContent = r.id;
        li.append(left, right);
        list.append(li);
      });
    }

    renderBookings();
  }

  /* ---------- 10. FAQ accordion: one panel open at a time ---------- */
  function initAccordion() {
    const groups = $$(".accordion");
    groups.forEach((group) => {
      const panels = $$("details", group);
      panels.forEach((panel) => {
        on(panel, "toggle", () => {
          if (!panel.open) return;
          panels.forEach((other) => { if (other !== panel) other.open = false; });
        });
      });
    });
  }

  /* ---------- Print mode (used for the PDF export) ---------- */
  function prepareForPrint() {
    document.body.classList.add("is-print");
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count) || 0;
      el.textContent = String(target) + (el.dataset.suffix || "");
    });
    $$("details").forEach((el) => { el.open = true; });
    $$(".site-nav").forEach((el) => el.classList.add("is-open"));

    // A scrolling marquee cannot be printed; rebuild it as a static strip.
    const ticker = $(".ticker");
    if (ticker && $("marquee", ticker)) {
      const strip = document.createElement("div");
      strip.className = "ticker__static";
      $$(".ticker__item", ticker).forEach((item) => {
        const span = document.createElement("span");
        span.textContent = item.textContent.trim();
        strip.appendChild(span);
      });
      ticker.appendChild(strip);
      ticker.classList.add("is-print");
    }
  }

  /* ==========================================================================
     PAGE MODULES — run the shared bits, then the page-specific feature
     ========================================================================== */
  function boot() {
    const isPrint = window.location.search.indexOf("print") !== -1;

    initNav();
    initTicker();
    initReveal();
    initChrome();
    initBag();

    const page = document.body.dataset.page;

    switch (page) {
      case "home":
        if (!isPrint) initCounters();
        break;
      case "products":
        initProducts();
        break;
      case "trustees":
        initTrustees();
        break;
      case "events":
        initCountdown();
        break;
      case "contact":
        initContactForms();
        initAccordion();
        break;
      default:
        break;
    }

    if (isPrint) prepareForPrint();
  }

  if (document.readyState === "loading") {
    on(document, "DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
