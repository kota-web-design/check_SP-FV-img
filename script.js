// Elements used by animations, the shared header, and placeholder forms.
const animatedElements = document.querySelectorAll(".fade-up");
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");
const currentNavLinks = document.querySelectorAll(".site-nav__link, .mobile-menu__link, .footer-links a");
const placeholderForms = document.querySelectorAll("[data-form-placeholder]");

document.documentElement.classList.add("js-enabled");

// Fade-up helper used by IntersectionObserver and fallback checks.
const showElement = (element) => {
  element.classList.add("is-visible");
};

const revealVisibleElements = () => {
  animatedElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const isVisible =
      rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;

    if (isVisible) {
      showElement(element);
    }
  });
};

const updateHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
};

// Keep the active navigation underline aligned with the current page or section.
const getPageName = (pathname) => pathname.split("/").pop() || "index.html";

const isCurrentNavigationLink = (link) => {
  const href = link.getAttribute("href");

  if (!href) {
    return false;
  }

  const linkUrl = new URL(href, window.location.href);
  const currentPage = getPageName(window.location.pathname);
  const linkPage = getPageName(linkUrl.pathname);

  if (linkPage !== currentPage) {
    return false;
  }

  if (currentPage === "company.html") {
    return window.location.hash === "#access" ? linkUrl.hash === "#access" : linkUrl.hash !== "#access";
  }

  if (currentPage === "index.html") {
    const currentHash = window.location.hash || "#top";
    return linkUrl.hash === currentHash || (currentHash === "#top" && linkUrl.hash === "");
  }

  return linkUrl.hash === "";
};

const updateCurrentNavigation = () => {
  currentNavLinks.forEach((link) => {
    if (isCurrentNavigationLink(link)) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

// Mobile menu state: visual class plus accessibility attributes.
const setMobileMenuState = (isOpen) => {
  if (!siteHeader || !menuToggle) {
    return;
  }

  siteHeader.classList.toggle("is-menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");

  if (mobileMenu) {
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  }

  mobileMenuLinks.forEach((link) => {
    if (window.innerWidth <= 768 && !isOpen) {
      link.setAttribute("tabindex", "-1");
    } else {
      link.removeAttribute("tabindex");
    }
  });
};

const closeMobileMenu = () => {
  setMobileMenuState(false);
};

const toggleMobileMenu = () => {
  if (!siteHeader || !menuToggle) {
    return;
  }

  setMobileMenuState(!siteHeader.classList.contains("is-menu-open"));
};

// Prevent placeholder forms from navigating until the real endpoint is wired.
placeholderForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (form.getAttribute("action") !== "#") {
      return;
    }

    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = "送信先の設定後に送信できるようになります。";
    }
  });
});

if ("IntersectionObserver" in window) {
  // Reveal sections once as they enter the viewport.
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        showElement(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
  window.addEventListener("load", () => {
    requestAnimationFrame(revealVisibleElements);
  });
  window.addEventListener("hashchange", () => {
    requestAnimationFrame(revealVisibleElements);
  });
  setTimeout(revealVisibleElements, 250);
} else {
  animatedElements.forEach(showElement);
}

// Header state and global event handlers.
updateHeaderState();
updateCurrentNavigation();
setMobileMenuState(false);
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("hashchange", updateCurrentNavigation);

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMobileMenu);
}

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  } else if (!siteHeader?.classList.contains("is-menu-open")) {
    setMobileMenuState(false);
  }
});
