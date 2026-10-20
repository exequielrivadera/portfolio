/* PULSO DIGITAL — interacciones del portfolio */
(() => {
  "use strict";

  // Mostrar la bienvenida en cada carga o recarga de la página.
  // Si el visitante prefiere reducir movimiento, conservamos una bienvenida estática y breve.
  const introScreen = document.querySelector("#intro-screen");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (introScreen) {
    document.body.classList.add("intro-sequence");
    introScreen.classList.add("is-visible");

    const introDuration = prefersReducedMotion ? 900 : 2100;
    const fadeDuration = prefersReducedMotion ? 0 : 600;

    window.setTimeout(() => {
      introScreen.classList.add("is-leaving");
      window.setTimeout(() => introScreen.remove(), fadeDuration);
    }, introDuration);
  }

  // Destellos de los tres divisores: izquierda→derecha, derecha→izquierda, izquierda→derecha.
  const heroDivider = document.querySelector(".hero-bottom-line");
  const projectDividerTrigger = document.querySelector(".projects-note");
  const aboutDividerTrigger = document.querySelector(".about-section .text-link");
  const dividerTriggers = [heroDivider, projectDividerTrigger, aboutDividerTrigger].filter(Boolean);

  if ("IntersectionObserver" in window) {
    const dividerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Observar la primera línea en sí, no toda la portada, permite
        // reiniciar el destello cada vez que la línea vuelve a cruzar la zona visible.
        if (entry.target === heroDivider) {
          heroDivider.classList.toggle("is-lit", entry.isIntersecting);
          return;
        }

        const section = entry.target.closest(".projects, .about-section");
        if (!section) return;
        // Quitar la clase al salir permite que CSS reproduzca la animación
        // desde el inicio cuando el visitante vuelve a pasar por la sección.
        section.classList.toggle("line-revealed", entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: "-2% 0px -12% 0px" });

    dividerTriggers.forEach((trigger) => dividerObserver.observe(trigger));
  } else {
    if (heroDivider) heroDivider.classList.add("is-lit");
    document.querySelectorAll(".projects, .about-section").forEach((section) => section.classList.add("line-revealed"));
  }


  // Última línea divisoria: electrocardiograma que cruza la línea una sola vez al llegar al footer.
  // La clase se añade una única vez durante esta carga y no se reactiva al volver a subir.
  const footerDivider = document.querySelector(".site-footer");
  if (footerDivider && "IntersectionObserver" in window && !prefersReducedMotion) {
    let footerHeartbeatPlayed = false;
    const footerHeartbeatObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !footerHeartbeatPlayed) {
          footerHeartbeatPlayed = true;
          footerDivider.classList.add("heartbeat-played");
          footerHeartbeatObserver.unobserve(footerDivider);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    footerHeartbeatObserver.observe(footerDivider);
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector("#main-nav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
      mainNav.classList.toggle("is-open", !isExpanded);
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
      }
    });
  }

  // Filtros accesibles para la grilla de proyectos.
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach((card) => {
        const shouldShow = filter === "todos" || card.dataset.category === filter;
        card.hidden = !shouldShow;
      });
    });
  });

  // Modal informativo de DocuCentral (no hay demo web pública).
  const dialog = document.querySelector("#docu-dialog");
  const openButtons = document.querySelectorAll("[data-open-docu]");
  const closeButtons = document.querySelectorAll("[data-close-docu]");

  const openDialog = () => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      document.body.classList.add("dialog-open");
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("dialog-open");
  };

  openButtons.forEach((button) => button.addEventListener("click", openDialog));
  closeButtons.forEach((button) => button.addEventListener("click", closeDialog));

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
  }

  // Año automático del pie de página.
  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
