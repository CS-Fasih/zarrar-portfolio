(function () {
  const phrases = [
    "AR/VR Developer",
    "Python Developer",
    "AI/ML Enthusiast",
    "Immersive VR Builder"
  ];
  const typewriter = document.getElementById("typewriter");
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const backToTop = document.querySelector(".back-to-top");
  const contactForm = document.getElementById("contact-form");
  const progressBar = document.querySelector(".scroll-progress span");
  const navItems = Array.from(document.querySelectorAll(".nav-links a[href^='#']:not(.nav-cta)"));
  const trackedSections = navItems
    .map((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      return target ? { link, target } : null;
    })
    .filter(Boolean);
  const LOCAL_CONTACT_API = "http://localhost:3001/api/contact";
  const PRODUCTION_CONTACT_API = "/api/contact";
  const CONTACT_API = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? LOCAL_CONTACT_API
    : PRODUCTION_CONTACT_API;

  function startTypewriter() {
    if (!typewriter) {
      return;
    }
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];
      typewriter.textContent = phrase.slice(0, charIndex);

      if (!deleting && charIndex < phrase.length) {
        charIndex += 1;
        window.setTimeout(tick, 70);
        return;
      }

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        window.setTimeout(tick, 1600);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(tick, 40);
        return;
      }

      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(tick, 220);
    }

    tick();
  }

  function setupReveal() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -60px 0px" });

    revealItems.forEach((item) => observer.observe(item));
  }

  function animateCount(stat) {
    const value = stat.querySelector(".count-value");
    if (!value || stat.dataset.counted === "true") {
      return;
    }

    stat.dataset.counted = "true";
    const target = Number.parseFloat(stat.dataset.target || "0");
    const decimals = Number.parseInt(stat.dataset.decimals || "0", 10);
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      value.textContent = current.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        value.textContent = target.toFixed(decimals);
      }
    }

    requestAnimationFrame(frame);
  }

  function setupCounters() {
    const stats = document.querySelectorAll(".stat");
    if (!("IntersectionObserver" in window)) {
      stats.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    stats.forEach((stat) => observer.observe(stat));
  }

  function updateScrollState() {
    const isScrolled = window.scrollY > 50;
    header && header.classList.toggle("scrolled", isScrolled);
    backToTop && backToTop.classList.toggle("visible", window.scrollY > 640);
    updateScrollProgress();
    updateActiveNav();
  }

  function updateScrollProgress() {
    if (!progressBar) {
      return;
    }
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress)).toFixed(2)}%`;
  }

  function updateActiveNav() {
    if (!trackedSections.length) {
      return;
    }
    const position = window.scrollY + 180;
    let activeItem = trackedSections[0];
    trackedSections.forEach((item) => {
      if (item.target.offsetTop <= position) {
        activeItem = item;
      }
    });
    trackedSections.forEach((item) => {
      const active = item === activeItem;
      item.link.classList.toggle("active", active);
      if (active) {
        item.link.setAttribute("aria-current", "page");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });
  }

  function setupMenu() {
    if (!menuToggle || !navLinks) {
      return;
    }

    menuToggle.addEventListener("click", () => {
      const open = !navLinks.classList.contains("open");
      navLinks.classList.toggle("open", open);
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  function setFormStatus(message, type) {
    const status = contactForm && contactForm.querySelector(".form-status");
    if (!status) {
      return;
    }
    status.textContent = message;
    status.className = "form-status";
    if (type) {
      status.classList.add(type);
    }
  }

  function validateContact(data) {
    if (!data.name || data.name.trim().length < 2) {
      return "Please enter your name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return "Please enter a valid email address.";
    }
    if (!data.subject) {
      return "Please choose a subject.";
    }
    if (!data.message || data.message.trim().length < 10) {
      return "Please write a message of at least 10 characters.";
    }
    return "";
  }

  function setupContactForm() {
    if (!contactForm) {
      return;
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector("button[type='submit']");
      const data = {
        name: contactForm.name.value.trim(),
        email: contactForm.email.value.trim(),
        subject: contactForm.subject.value,
        message: contactForm.message.value.trim()
      };
      const error = validateContact(data);
      if (error) {
        setFormStatus(error, "error");
        return;
      }

      setFormStatus("Sending your message...", "");
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(CONTACT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || "Message could not be sent.");
        }
        contactForm.reset();
        setFormStatus("Message sent. Zarrar will get back to you soon.", "success");
      } catch (fetchError) {
        setFormStatus(fetchError.message || "Contact service is unavailable right now.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Message \u2192";
        }
      }
    });
  }

  function setupCopyEmail() {
    const copyButton = document.querySelector("[data-copy-email]");
    const status = document.querySelector(".copy-status");
    if (!copyButton) {
      return;
    }

    function setCopyStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    copyButton.addEventListener("click", async () => {
      const email = copyButton.dataset.copyEmail || "";
      try {
        await copyText(email);
        setCopyStatus("Email copied to clipboard.");
      } catch (error) {
        setCopyStatus("Email is zarrarabbas73@gmail.com.");
      }
    });
  }

  function setupEvidenceGallery() {
    const gallery = document.getElementById("evidence");
    const lightbox = document.getElementById("proof-lightbox");
    if (!gallery || !lightbox) {
      return;
    }

    const filters = Array.from(gallery.querySelectorAll(".evidence-filter"));
    const cards = Array.from(gallery.querySelectorAll(".evidence-card"));
    const image = document.getElementById("proof-lightbox-image");
    const title = document.getElementById("proof-lightbox-title");
    const module = document.getElementById("proof-lightbox-module");
    const count = document.getElementById("proof-lightbox-count");
    const closeButtons = lightbox.querySelectorAll("[data-lightbox-close]");
    const previousButton = lightbox.querySelector("[data-lightbox-prev]");
    const nextButton = lightbox.querySelector("[data-lightbox-next]");
    let visibleCards = cards.slice();
    let currentCard = null;
    let currentGallery = [];
    let currentIndex = 0;
    let lastFocused = null;

    function syncVisibleCards() {
      visibleCards = cards.filter((card) => !card.classList.contains("is-hidden"));
    }

    function cardImages(card) {
      const moduleName = card.dataset.moduleLabel || "FYP Evidence";
      const moduleCode = (card.dataset.module || "").toUpperCase();
      return Array.from(card.querySelectorAll("[data-proof-image]")).map((cardImage, index) => ({
        src: cardImage.currentSrc || cardImage.src,
        alt: cardImage.alt || `${moduleName} screenshot ${index + 1}`,
        moduleName,
        moduleCode
      }));
    }

    function showLightbox(card, index) {
      currentCard = card;
      currentGallery = cardImages(card);
      if (!currentGallery.length) {
        return;
      }
      currentIndex = (index + currentGallery.length) % currentGallery.length;
      const data = currentGallery[currentIndex];
      image.src = data.src;
      image.alt = data.alt;
      module.textContent = data.moduleCode ? `${data.moduleCode} · ${data.moduleName}` : data.moduleName;
      title.textContent = data.moduleName;
      count.textContent = `Screenshot ${currentIndex + 1} of ${currentGallery.length} · ${visibleCards.length} module${visibleCards.length === 1 ? "" : "s"} shown`;
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      const closeButton = lightbox.querySelector(".proof-close");
      if (closeButton) {
        closeButton.focus();
      }
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
      if (lastFocused) {
        lastFocused.focus();
      }
    }

    function moveLightbox(delta) {
      if (currentCard) {
        showLightbox(currentCard, currentIndex + delta);
      }
    }

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        const selected = filter.dataset.filter || "all";
        filters.forEach((button) => {
          const active = button === filter;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        cards.forEach((card) => {
          const hidden = selected !== "all" && card.dataset.module !== selected;
          const triggers = card.querySelectorAll(".evidence-thumb, .evidence-mini");
          card.classList.toggle("is-hidden", hidden);
          card.setAttribute("aria-hidden", String(hidden));
          triggers.forEach((trigger) => {
            trigger.tabIndex = hidden ? -1 : 0;
          });
        });
        syncVisibleCards();
      });
    });

    cards.forEach((card) => {
      const triggers = card.querySelectorAll(".evidence-thumb, .evidence-mini");
      triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
          lastFocused = trigger;
          syncVisibleCards();
          showLightbox(card, Number(trigger.dataset.proofIndex || 0));
        });
      });
    });

    closeButtons.forEach((button) => button.addEventListener("click", closeLightbox));
    previousButton && previousButton.addEventListener("click", () => moveLightbox(-1));
    nextButton && nextButton.addEventListener("click", () => moveLightbox(1));

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) {
        return;
      }
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowLeft") {
        moveLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        moveLightbox(1);
      }
    });
  }

  function setupVideoModal() {
    const modal = document.getElementById("video-lightbox");
    const frame = document.getElementById("video-lightbox-frame");
    const title = document.getElementById("video-lightbox-title");
    const code = document.getElementById("video-lightbox-code");
    const link = document.getElementById("video-lightbox-link");
    const triggers = Array.from(document.querySelectorAll("[data-video-id]"));
    if (!modal || !frame || !triggers.length) {
      return;
    }

    const closeButtons = modal.querySelectorAll("[data-video-close]");
    let lastFocused = null;

    function closeVideo() {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      frame.removeAttribute("src");
      frame.title = "";
      document.body.classList.remove("lightbox-open");
      if (lastFocused) {
        lastFocused.focus();
      }
    }

    function openVideo(trigger) {
      const videoId = trigger.dataset.videoId || "";
      const videoTitle = trigger.dataset.videoTitle || "FYP Video Demo";
      const videoCode = trigger.dataset.videoCode || "FYP";
      const videoUrl = trigger.dataset.videoUrl || `https://youtu.be/${videoId}`;
      if (!videoId) {
        return;
      }

      lastFocused = trigger;
      if (!/^https?:$/.test(window.location.protocol)) {
        window.open(videoUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const origin = window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
      frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0${origin}`;
      frame.title = `${videoTitle} video demo`;
      if (title) {
        title.textContent = videoTitle;
      }
      if (code) {
        code.textContent = `${videoCode} · YouTube demo`;
      }
      if (link) {
        link.href = videoUrl;
      }
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      const closeButton = modal.querySelector(".video-close");
      if (closeButton) {
        closeButton.focus();
      }
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openVideo(trigger));
    });
    closeButtons.forEach((button) => button.addEventListener("click", closeVideo));
    document.addEventListener("keydown", (event) => {
      if (modal.hidden) {
        return;
      }
      if (event.key === "Escape") {
        closeVideo();
      }
    });
  }

  function setupHolographicGlow() {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) {
      return;
    }

    const cards = document.querySelectorAll([
      ".stat-card",
      ".focus-card",
      ".skill-category",
      ".project-card",
      ".evidence-card",
      ".video-card",
      ".achievement-card"
    ].join(", "));

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "50%");
      });
    });
  }

  startTypewriter();
  setupReveal();
  setupCounters();
  setupMenu();
  setupContactForm();
  setupCopyEmail();
  setupEvidenceGallery();
  setupVideoModal();
  setupHolographicGlow();
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);
  window.addEventListener("hashchange", () => window.setTimeout(updateScrollState, 180));
  window.addEventListener("load", () => window.setTimeout(updateScrollState, 180));
})();
