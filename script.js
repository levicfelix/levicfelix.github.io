(() => {
  const carousel = document.querySelector(".carousel");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));
  const previousButton = document.querySelector(".carousel-control--prev");
  const nextButton = document.querySelector(".carousel-control--next");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let activeSlide = 0;
  let rotationTimer;

  const stopRotation = () => window.clearInterval(rotationTimer);

  const startRotation = () => {
    stopRotation();
    if (!reducedMotion.matches && document.visibilityState === "visible") {
      rotationTimer = window.setInterval(() => showSlide(activeSlide + 1, false), 5000);
    }
  };

  const showSlide = (index, restart = true) => {
    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (restart) startRotation();
  };

  previousButton?.addEventListener("click", () => showSlide(activeSlide - 1));
  nextButton?.addEventListener("click", () => showSlide(activeSlide + 1));
  dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.slideTo))));

  carousel?.addEventListener("mouseenter", stopRotation);
  carousel?.addEventListener("mouseleave", startRotation);
  carousel?.addEventListener("focusin", stopRotation);
  carousel?.addEventListener("focusout", startRotation);
  reducedMotion.addEventListener?.("change", startRotation);
  document.addEventListener("visibilitychange", startRotation);
  startRotation();

  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const trackedSections = Array.from(document.querySelectorAll("[data-section]"));
  const navScroller = document.querySelector(".nav-links");

  const setActiveSection = (sectionName) => {
    navLinks.forEach((link) => {
      const isActive = link.dataset.nav === sectionName;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
        if (navScroller && navScroller.scrollWidth > navScroller.clientWidth) {
          navScroller.scrollTo({
            left: link.offsetLeft - (navScroller.clientWidth - link.offsetWidth) / 2,
            behavior: reducedMotion.matches ? "auto" : "smooth"
          });
        }
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let scrollFrame;
  const updateActiveSection = () => {
    const readingLine = window.scrollY + window.innerHeight * 0.32;
    let currentSection = trackedSections[0]?.dataset.section || "home";

    trackedSections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= readingLine) currentSection = section.dataset.section;
    });

    setActiveSection(currentSection);
    scrollFrame = undefined;
  };

  const requestSectionUpdate = () => {
    if (scrollFrame === undefined) scrollFrame = window.requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener("scroll", requestSectionUpdate, { passive: true });
  window.addEventListener("resize", requestSectionUpdate);
  window.addEventListener("hashchange", requestSectionUpdate);
  navLinks.forEach((link) => link.addEventListener("click", () => setActiveSection(link.dataset.nav)));
  requestSectionUpdate();
})();
