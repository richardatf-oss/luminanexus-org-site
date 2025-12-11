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
// 231 Gates interactive matrix
(function () {
  const gridEl = document.getElementById("gates-grid");
  const detailsEl = document.getElementById("gates-details");
  if (!gridEl || !detailsEl) return; // only run on the 231 Gates page

  const letters = [
    "א","ב","ג","ד","ה","ו","ז","ח","ט","י","כ","ל",
    "מ","נ","ס","ע","פ","צ","ק","ר","ש","ת"
  ];

  // Sample gate data; this can grow over time.
  const gatesData = {
    "אב": {
      label: "Av",
      tree: "Etz HaReishit — Tree of Origin",
      description: "Field (Aleph) entering a house (Bet); the principle, the root-father of many paths."
    },
    "אג": {
      label: "Ag",
      tree: "Etz HaReishit — Tree of Origin",
      description: "Aleph meets motion (Gimel); the first going-out from simple stillness."
    },
    "אד": {
      label: "Ad",
      tree: "Etz HaReishit / Etz HaMar’ah",
      description: "Presence at the door; a threshold between worlds, and a mirror between inside and outside."
    },
    "אש": {
      label: "Esh",
      tree: "Etz HaEsh — Tree of Fire",
      description: "Fire; the Field igniting into tongues of flame and speech."
    },
    "לב": {
      label: "Lev",
      tree: "Etz HaEven — The Stone Tree",
      description: "Heart-house; an inner room where years can either fossilize or soften."
    },
    "גל": {
      label: "Gal",
      tree: "Etz HaEven / Etz HaSheleg",
      description: "Wave or stone-heap; rolling memory, cairns in the desert, snowdrifts over old tracks."
    },
    "ים": {
      label: "Yam",
      tree: "Etz HaMayim — Tree of Water",
      description: "Sea; countless drops gathered into one moving body."
    },
    "מי": {
      label: "Mi / Mei",
      tree: "Etz HaMayim — Tree of Water",
      description: "Who / waters; water as a question, flowing around every boundary."
    },
    "של": {
      label: "Shel / Shal",
      tree: "Etz HaSheleg — Tree of Snow",
      description: "To belong / to send; snow sent to cover and hush the world into clarity."
    },
    "קר": {
      label: "Kar",
      tree: "Etz HaSheleg / Etz HaMar’ah",
      description: "Cold; the cool distance that can reveal patterns—and sometimes, the chill of judgment."
    },
    "נר": {
      label: "Ner",
      tree: "Etz HaShirah / Etz HaEsh",
      description: "Candle; a tiny column of flame singing in the dark."
    },
    "קל": {
      label: "Kol",
      tree: "Etz HaShirah — Tree of Song",
      description: "Voice; vibration itself as a path between worlds."
    }
  };

  function showGate(key) {
    const info = gatesData[key];
    if (!info) return;

    detailsEl.innerHTML = `
      <h3>${key} — ${info.label}</h3>
      <p class="gates-details-tree">${info.tree}</p>
      <p>${info.description}</p>
      <p class="gates-details-notes">
        This is a draft mapping. In the full Celestial Library, this gate can
        link to sources, stories, and its place among the 231.
      </p>
    `;
  }

  function createCell(text, className) {
    const div = document.createElement("div");
    div.className = "gates-cell " + className;
    if (text) {
      div.textContent = text;
    }
    return div;
  }

  // Build matrix: (blank corner + top headers) + 22 rows of (row header + cells)
  const cols = letters.length + 1;
  gridEl.style.setProperty("--gates-cols", String(cols));

  // Top-left corner cell
  gridEl.appendChild(createCell("", "gates-cell--corner"));

  // Top header row
  letters.forEach((letter) => {
    gridEl.appendChild(createCell(letter, "gates-cell--header"));
  });

  // Rows
  for (let i = 0; i < letters.length; i++) {
    const rowLetter = letters[i];

    // Row header
    gridEl.appendChild(createCell(rowLetter, "gates-cell--header"));

    for (let j = 0; j < letters.length; j++) {
      const colLetter = letters[j];

      // We only use combinations above the diagonal (j > i)
      if (j <= i) {
        gridEl.appendChild(createCell("", "gates-cell--disabled"));
        continue;
      }

      const key = rowLetter + colLetter;
      const info = gatesData[key];

      if (info) {
        const cell = createCell("", "gates-cell--active");
        cell.setAttribute("aria-label", `${key} — ${info.label}`);
        cell.dataset.gate = key;
        cell.addEventListener("click", () => showGate(key));
        gridEl.appendChild(cell);
      } else {
        gridEl.appendChild(createCell("", "gates-cell--empty"));
      }
    }
  }
})();
