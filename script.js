const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function closeMenu() {
  if (!menuButton || !navLinks) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  navLinks.classList.remove("is-open");
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  navLinks?.classList.toggle("is-open", !isOpen);
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const navItems = [...(navLinks?.querySelectorAll("a[href^='#']") ?? [])];
const navTargets = navItems
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navTargets.length) {
  const updateCurrentSection = () => {
    const readingLine = window.innerHeight * 0.47;
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const currentTarget = atPageEnd ? navTargets[navTargets.length - 1] : navTargets.find((target) => {
      const bounds = target.getBoundingClientRect();
      return bounds.top <= readingLine && bounds.bottom > readingLine;
    }) ?? navTargets[0];

    navItems.forEach((link) => {
      if (link.hash === `#${currentTarget.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  let navFrame = 0;
  const scheduleNavigationUpdate = () => {
    if (navFrame) return;
    navFrame = window.requestAnimationFrame(() => {
      navFrame = 0;
      updateCurrentSection();
    });
  };

  window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavigationUpdate, { passive: true });
  updateCurrentSection();
}

if (!reducedMotion.matches) {
  const sky = document.querySelector(".scene__sky");
  const peaks = document.querySelector(".scene__peaks");
  let frame = 0;

  const updateParallax = () => {
    frame = 0;
    const offset = Math.min(window.scrollY, window.innerHeight) * 0.035;
    if (sky) sky.style.transform = `translate3d(0, ${offset}px, 0)`;
    if (peaks) peaks.style.transform = `translate3d(0, ${offset * -0.16}px, 0)`;
  };

  window.addEventListener("scroll", () => {
    if (!frame) frame = window.requestAnimationFrame(updateParallax);
  }, { passive: true });

  updateParallax();
}

const features = document.querySelector(".features");
if (features && !reducedMotion.matches && "IntersectionObserver" in window) {
  features.classList.add("motion-ready");
  const featureObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    features.classList.add("is-entered");
    featureObserver.disconnect();
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  featureObserver.observe(features);
}

const faq = document.querySelector(".faq");
const faqQuestions = faq?.querySelector(".faq__questions");
const faqTabs = [...(faq?.querySelectorAll(".faq-question") ?? [])];
const faqPanel = faq?.querySelector(".faq-answer");
const faqRoute = faq?.querySelector("#faq-route");
const faqValue = faq?.querySelector("#faq-value");
const faqLabel = faq?.querySelector("#faq-label");
const faqCopy = faq?.querySelector("#faq-copy");
let faqUpdateTimer;

function updateFaqCursor() {
  const activeTab = faqTabs.find((tab) => tab.getAttribute("aria-selected") === "true");
  if (!faqQuestions || !activeTab) return;
  const listRect = faqQuestions.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();
  faqQuestions.style.setProperty("--faq-cursor-y", `${tabRect.top - listRect.top}px`);
  faqQuestions.style.setProperty("--faq-cursor-height", `${tabRect.height}px`);
}

function selectFaqQuestion(tab, moveFocus = false) {
  if (!tab) return;
  if (moveFocus) tab.focus();
  if (tab.getAttribute("aria-selected") === "true") return;

  faqTabs.forEach((channel) => {
    const selected = channel === tab;
    channel.setAttribute("aria-selected", String(selected));
    channel.tabIndex = selected ? 0 : -1;
  });
  updateFaqCursor();
  window.clearTimeout(faqUpdateTimer);
  faqPanel?.classList.remove("is-decoding");
  if (faqPanel) void faqPanel.offsetWidth;
  if (faqRoute) faqRoute.textContent = tab.dataset.route ?? "";
  if (faqValue) {
    faqValue.textContent = tab.dataset.value ?? "";
    if (tab.dataset.kind) faqValue.dataset.kind = tab.dataset.kind;
    else faqValue.removeAttribute("data-kind");
  }
  if (faqLabel) faqLabel.textContent = tab.dataset.label ?? "";
  if (faqCopy) faqCopy.textContent = tab.dataset.copy ?? "";
  faqPanel?.setAttribute("aria-labelledby", tab.id);
  faqPanel?.classList.add("is-decoding");
  if (reducedMotion.matches) {
    faqPanel?.classList.remove("is-decoding");
  } else {
    faqUpdateTimer = window.setTimeout(() => faqPanel?.classList.remove("is-decoding"), 2000);
  }
}

updateFaqCursor();
window.addEventListener("resize", updateFaqCursor, { passive: true });

faqTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectFaqQuestion(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % faqTabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + faqTabs.length) % faqTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = faqTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectFaqQuestion(faqTabs[nextIndex], true);
  });
});

if (faq) {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    faq.classList.add("is-entered");
  } else {
    faq.classList.add("motion-ready");
    const faqObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      faq.classList.add("is-entered");
      faqObserver.disconnect();
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    faqObserver.observe(faq);
  }
}

const about = document.querySelector(".about");
if (about) {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    about.classList.add("is-entered");
  } else {
    about.classList.add("motion-ready");
    const aboutObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      about.classList.add("is-entered");
      aboutObserver.disconnect();
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    aboutObserver.observe(about);
  }
}

const contact = document.querySelector(".contact");
if (contact) {
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    contact.classList.add("is-entered");
  } else {
    contact.classList.add("motion-ready");
    const contactObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      contact.classList.add("is-entered");
      contactObserver.disconnect();
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    contactObserver.observe(contact);
  }
}

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const email = String(formData.get("email"));
    const message = `Please get in touch with me about the AI framework.\n\nMy email: ${email}`;
    const subject = "Let’s talk about what’s next";
    const recipient = contactForm.dataset.recipient ?? "";
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    const status = contactForm.querySelector(".contact__status");
    if (status) {
      status.textContent = recipient
        ? "Your email app is opening with the brief ready to send."
        : "Draft prepared. Add the company email address as the recipient to send it.";
    }
  });
}
