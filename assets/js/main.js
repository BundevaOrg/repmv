(() => {
  // Шапка: граница после начала прокрутки
  const header = document.querySelector("[data-header]");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Мобильное меню
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  };

  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Просмотр скриншотов отзывов
  const dialog = document.querySelector("[data-review-dialog]");
  const media = dialog.querySelector("[data-review-media]");
  const caption = dialog.querySelector("[data-review-caption]");

  document.querySelectorAll("[data-review]").forEach((button) => {
    button.addEventListener("click", () => {
      const { src, caption: text } = button.dataset;
      media.replaceChildren();

      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = text || "Скриншот переписки";
        media.append(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "placeholder placeholder--screenshot";
        ph.innerHTML = '<span class="placeholder__label">Скриншот переписки · 9:19.5 · имена и аватары скрыты</span>';
        media.append(ph);
      }

      caption.textContent = text || "";
      dialog.showModal();
    });
  });

  dialog.querySelector("[data-review-close]").addEventListener("click", () => dialog.close());
  // Клик по подложке закрывает окно
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  // Плавное появление блоков
  const items = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
})();
