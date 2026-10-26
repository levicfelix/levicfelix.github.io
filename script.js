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
      slide.tabIndex = isActive ? 0 : -1;
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

  const publicationItems = Array.from(document.querySelectorAll(".publication"));

  publicationItems.forEach((publication, index) => {
    const year = publication.querySelector(".publication-year")?.textContent.trim();
    const previousYear = publicationItems[index - 1]?.querySelector(".publication-year")?.textContent.trim();
    const nextYear = publicationItems[index + 1]?.querySelector(".publication-year")?.textContent.trim();

    publication.classList.toggle("publication--year-start", year !== previousYear);
    publication.classList.toggle("publication--year-end", year !== nextYear);

    const content = publication.querySelector(":scope > div");
    const title = content?.querySelector(":scope > h3");
    let heading = content?.querySelector(":scope > .publication-heading");

    if (content && title && !heading) {
      heading = document.createElement("div");
      heading.className = "publication-heading";
      title.before(heading);
      heading.append(title);
    }

    const journal = content?.querySelector(":scope > .journal");
    const publicationLink = journal?.querySelector("a");

    if (heading && publicationLink) {
      publicationLink.className = "doi-link";
      publicationLink.replaceChildren();

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("aria-hidden", "true");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#icon-link");
      icon.append(use);
      publicationLink.append(icon, "DOI");
      heading.append(publicationLink);
    }

    if (journal && !journal.querySelector("em")) {
      const citation = journal.textContent.trim();
      const match = citation.match(/^(.*)\s+(\d+(?:\([^)]*\))?),\s+(.+)$/);

      if (match) {
        const journalName = document.createElement("em");
        journalName.textContent = match[1];
        const volume = document.createElement("strong");
        volume.textContent = match[2];
        journal.replaceChildren(journalName, " ", volume, `, ${match[3]}`);
      }
    }
  });

  const contactForm = document.querySelector("#contact-form");
  const contactStatus = document.querySelector("#contact-status");
  const deliverySubject = document.querySelector("#contact-delivery-subject");
  const contactButton = contactForm?.querySelector('button[type="submit"]');
  const pageUrl = new URL(window.location.href);

  if (pageUrl.searchParams.get("message") === "sent" && contactStatus) {
    contactStatus.textContent = "Your message was sent. A copy has been emailed to you.";
    contactStatus.hidden = false;
    pageUrl.searchParams.delete("message");
    window.history.replaceState({}, "", `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`);
  }

  contactForm?.addEventListener("submit", () => {
    const formData = new FormData(contactForm);
    const subject = String(formData.get("subject") || "").trim();

    if (deliverySubject) {
      deliverySubject.value = subject || "New website message";
    }

    if (contactStatus) {
      contactStatus.textContent = "Sending your message securely…";
      contactStatus.hidden = false;
    }

    if (contactButton) {
      contactButton.disabled = true;
      contactButton.textContent = "Sending…";
    }
  });
})();
