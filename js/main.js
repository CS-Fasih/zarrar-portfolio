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
  const LOCAL_CONTACT_API = "http://localhost:3001/api/contact";
  const PRODUCTION_CONTACT_API = "https://zarrar-portfolio-api.onrender.com/api/contact";
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

  function setupHolographicDepth() {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) {
      return;
    }

    const cards = document.querySelectorAll([
      ".stat-card",
      ".skill-category",
      ".project-card",
      ".video-card",
      ".achievement-card"
    ].join(", "));

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 12;
        const rotateX = (0.5 - y) * 10;
        card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
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
  setupHolographicDepth();
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
})();
