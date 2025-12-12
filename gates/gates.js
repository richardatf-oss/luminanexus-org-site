// gates/gates.js
// Minimal interactive logic for the 231 Gates sample page.
// Later, this file can grow into a full star-map renderer.

const SAMPLE_GATES = {
  "אב": {
    name: "Gate אב — Aleph–Bet",
    letters: "א (origin, breath) + ב (house, inside)",
    field:
      "From Ein Sof into a first interior: the Field stepping inside itself, from undifferentiated light into a shelter where worlds can begin.",
    trees:
      "Between Etz HaReishit (Tree of Origin) and future Trees of Home, Family, and Sanctuary."
  },
  "אג": {
    name: "Gate אג — Aleph–Gimel",
    letters: "א (silent source) + ג (giver, camel, movement across distance)",
    field:
      "The Field pouring itself across a gap: generosity, transmission, and the risk of crossing deserts of not-knowing.",
    trees:
      "Between the Tree of Origin and works about learning, teaching, and long journeys—Torah carried across time."
  },
  "אד": {
    name: "Gate אד — Aleph–Dalet",
    letters: "א (One) + ד (doorway, poverty, openness)",
    field:
      "The One knocking at the door of the poor. A Gate of humility, access, and choosing to open or close.",
    trees:
      "Between Etz HaReishit and Trees about justice, hospitality, and who gets to enter sacred spaces."
  },
  "אמ": {
    name: "Gate אמ — Aleph–Mem",
    letters: "א (breath) + מ (water, womb, chaos and birth)",
    field:
      "The first breath above the waters. A Gate of creation, mikveh, and immersion that becomes new life.",
    trees:
      "Between the Tree of Origin and Etz HaMayim (Tree of Water), and all projects dealing with birth, teshuvah, and healing."
  },
  "אש": {
    name: "Gate אש — Aleph–Shin",
    letters: "א (breath) + ש (fire, tooth, consuming change)",
    field:
      "Breath meeting flame. A Gate of prophecy, risk, and refinement: what happens when raw presence moves through fire.",
    trees:
      "Between Etz HaReishit and Etz HaEsh (Tree of Fire): holy fire, creative drive, and the dangers of zeal."
  },
  "בת": {
    name: "Gate בת — Bet–Tav",
    letters: "ב (house) + ת (mark, seal, completion)",
    field:
      "The house at the end of the story. A Gate of legacies, wills, and what remains after a life has been lived.",
    trees:
      "Between Trees of Home/Family and future Trees of Time and Memory; a path for autobiographical and generational projects."
  },
  "גל": {
    name: "Gate גל — Gimel–Lamed",
    letters: "ג (giver, traveler) + ל (learning, guidance, staff)",
    field:
      "A moving lesson: learning that only appears while walking. The Gate of guided journeys and mentoring.",
    trees:
      "Between learning-oriented Trees and pilgrimage projects—journeys to Jerusalem, Kingman↔Jerusalem lines, and study-travel."
  },
  "לב": {
    name: "Gate לב — Lamed–Bet",
    letters: "ל (heart-learning, ‘learned’) + ב (house, inside)",
    field:
      "The heart as a house, and the house as something that can be taught to feel. A Gate of inner education.",
    trees:
      "Between Trees of pedagogy and Trees of Home—how we build houses, schools, and communities that actually have a לב."
  },
  "שלום": {
    name: "Gate שלום — Shalom as a composite Gate",
    letters:
      "ש (fire) + ל (learning) + ו (connection) + ם (enclosure, ocean of being)",
    field:
      "Not one pair but a cluster: fire, learning, connection, and enclosure resolving into peace. A Gate for conflict-healing.",
    trees:
      "Between multiple Trees at once: Mirrors, Fire, Water, Cities, and Children. A future hub-Gate for peacemaking projects."
  }
};

function applyGateToDetail(gateKey) {
  const gate = SAMPLE_GATES[gateKey];
  const nameEl = document.getElementById("gate-name");
  const summaryEl = document.getElementById("gate-summary");
  const lettersEl = document.getElementById("gate-letters");
  const fieldEl = document.getElementById("gate-field");
  const treesEl = document.getElementById("gate-trees");

  if (!gate || !nameEl || !summaryEl || !lettersEl || !fieldEl || !treesEl) {
    return;
  }

  nameEl.textContent = gate.name;
  summaryEl.textContent =
    gate.summary ||
    "This Gate is still in early notes. For now, here are a few hints at how it might move through the Field.";
  lettersEl.textContent = gate.letters || "—";
  fieldEl.textContent = gate.field || "—";
  treesEl.textContent = gate.trees || "—";
}

function setActivePill(clicked) {
  document.querySelectorAll(".gate-pill").forEach((pill) => {
    pill.classList.toggle("gate-pill-active", pill === clicked);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pills = document.querySelectorAll(".gate-pill");

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const gateKey = pill.getAttribute("data-gate");
      setActivePill(pill);
      applyGateToDetail(gateKey);
    });
  });

  // Optionally, auto-select the first Gate on load
  if (pills.length > 0) {
    pills[0].click();
  }
});
