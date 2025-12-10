// script.js — shared behavior for LuminaNexus.org

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  // Mobile nav toggle
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      nav.classList.toggle("open");
    });

    // Close nav when a link is clicked (on mobile)
    nav.addEventListener("click", (event) => {
      const target = event.target;
      if (target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        navToggle.classList.remove("open");
      }
    });
  }

  // Smooth scroll for in-page anchors like #mission, #projects, etc. (home page)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80; // slight offset for header
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Active nav link highlighting
  const currentPath = window.location.pathname || "/";
  const links = document.querySelectorAll(".site-nav a");

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";

    // Home / Mission (root)
    if (href === "#mission" && (currentPath === "/" || currentPath === "")) {
      link.classList.add("nav-active");
      return;
    }

    // Library
    if (href.startsWith("/library") && currentPath.startsWith("/library")) {
      link.classList.add("nav-active");
      return;
    }

    // Chavruta
    if (href.startsWith("/chavruta") && currentPath.startsWith("/chavruta")) {
      link.classList.add("nav-active");
      return;
    }
  });
});
