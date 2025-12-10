document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      nav.classList.toggle("open");
    });

    // Close nav when clicking a link (mobile)
    nav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("open");
        nav.classList.remove("open");
      });
    });
  }

  // Smooth-ish scroll with offset for sticky header
  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        const rect = target.getBoundingClientRect();
        const offset = window.scrollY + rect.top - headerHeight - 12;

        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      }
    });
  });

  // Dynamic year in footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});
