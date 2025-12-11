// ---===### ZNO CLUE COLLECTOR - WEB VERSION ###===---

let questions = [];
let clues = []; // {text: string, target: 'q' | 'a'}
let victoryQuestion = null; // store the winning question for click-to-view

// ---=== INIT ===---
async function init() {
  try {
    const response = await fetch("questions_full.json");
    questions = await response.json();
    document.getElementById("questionCount").textContent = questions.length;
    console.log(`Loaded ${questions.length} questions`);
  } catch (e) {
    console.error("Failed to load questions:", e);
    document.getElementById("stats").innerHTML =
      '<span class="stat" style="color: var(--danger)">Failed to load questions.json</span>';
  }
}

// ---=== FAST FUZZY MATCHING ===---

// Quick score - no Levenshtein, just contains + word overlap
function quickScore(query, text) {
  query = query.toLowerCase().trim();
  text = text.toLowerCase();

  if (!query || !text) return 0;
  if (text.includes(query)) return 100;

  // word overlap scoring
  const qWords = query.split(/\s+/).filter((w) => w.length >= 2);
  if (qWords.length === 0) return 0;

  let matches = 0;
  for (const qw of qWords) {
    if (text.includes(qw)) matches++;
  }
  return (matches / qWords.length) * 80;
}

// Detailed score with Levenshtein - only for top candidates
function detailedScore(query, text) {
  query = query.toLowerCase().trim();
  text = text.toLowerCase();

  if (!query || !text) return 0;
  if (text.includes(query)) return 100;

  const qWords = query.split(/\s+/).filter((w) => w.length >= 2);
  if (qWords.length === 0) return quickScore(query, text);

  const textWords = text.split(/\s+/).filter((w) => w.length >= 2);
  let totalScore = 0;

  for (const qw of qWords) {
    if (text.includes(qw)) {
      totalScore += 100;
      continue;
    }

    // find best matching word
    let bestMatch = 0;
    for (const tw of textWords) {
      // quick length check - skip if too different
      if (Math.abs(qw.length - tw.length) > 3) continue;

      const dist = levenshteinFast(qw, tw);
      const maxLen = Math.max(qw.length, tw.length);
      const score = Math.max(0, (1 - dist / maxLen) * 100);
      if (score > bestMatch) bestMatch = score;
      if (bestMatch >= 90) break; // good enough
    }
    totalScore += bestMatch;
  }

  return Math.round(totalScore / qWords.length);
}

// Optimized Levenshtein with early exit
function levenshteinFast(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // early exit if too different
  if (Math.abs(a.length - b.length) > 5) return Math.max(a.length, b.length);

  let prev = [];
  let curr = [];

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

// ---=== SCORING ===---
function getSearchText(q, target) {
  return target === "q"
    ? q.question_text
    : Object.values(q.options || {}).join(" | ");
}

function quickScoreQuestion(q) {
  if (clues.length === 0) return 0;
  let total = 0;
  for (const clue of clues) {
    total += quickScore(clue.text, getSearchText(q, clue.target));
  }
  return total / clues.length;
}

function detailedScoreQuestion(q) {
  if (clues.length === 0) return { total: 0, clueScores: {} };
  const clueScores = {};
  for (let i = 0; i < clues.length; i++) {
    const clue = clues[i];
    clueScores[i] = detailedScore(clue.text, getSearchText(q, clue.target));
  }
  const total =
    Object.values(clueScores).reduce((a, b) => a + b, 0) / clues.length;
  return { total, clueScores };
}

function search(limit = 10) {
  if (clues.length === 0) return [];

  // PASS 1: Quick score all questions
  const quickScored = questions.map((q, idx) => ({
    idx,
    q,
    score: quickScoreQuestion(q),
  }));

  // Sort and take top 50 candidates for detailed scoring
  quickScored.sort((a, b) => b.score - a.score);
  const candidates = quickScored.slice(0, 50);

  // PASS 2: Detailed score only top candidates
  const results = candidates.map(({ q }) => {
    const { total, clueScores } = detailedScoreQuestion(q);
    return { q, total, clueScores };
  });

  results.sort((a, b) => b.total - a.total);
  return results.slice(0, limit);
}

// ---=== CLUE MANAGEMENT ===---
function addClue(target) {
  const input = document.getElementById("clueText");
  const text = input.value.trim();
  if (!text || text.length < 2) {
    input.placeholder = "Enter at least 2 characters...";
    setTimeout(() => (input.placeholder = "Enter a clue..."), 2000);
    return;
  }

  clues.push({ text, target });
  input.value = "";
  input.focus();

  renderClues();
  doSearch();
}

function removeClue(index) {
  clues.splice(index, 1);
  renderClues();
  doSearch();
}

function toggleClue(index) {
  clues[index].target = clues[index].target === "q" ? "a" : "q";
  renderClues();
  doSearch();
}

function clearClues() {
  clues = [];
  renderClues();
  document.getElementById("resultsList").innerHTML =
    '<p class="empty-state">Add clues to start searching</p>';
  document.getElementById("victory").style.display = "none";
}

function renderClues() {
  const container = document.getElementById("cluesList");

  if (clues.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No clues yet. Add some above!</p>';
    document.getElementById("clearBtn").style.display = "none";
    return;
  }

  document.getElementById("clearBtn").style.display = "block";

  container.innerHTML = clues
    .map(
      (clue, i) => `
        <div class="clue-tag ${clue.target === "q" ? "question" : "answer"}">
            <span class="type" onclick="toggleClue(${i})" style="cursor: pointer;" title="Click to toggle Q/A">${clue.target === "q" ? "Q" : "A"}</span>
            <span>${escapeHtml(clue.text)}</span>
            <button class="remove" onclick="removeClue(${i})">&times;</button>
        </div>
    `
    )
    .join("");
}

// ---=== SEARCH & DISPLAY ===---
function doSearch() {
  const results = search(10);

  if (results.length === 0) {
    document.getElementById("resultsList").innerHTML =
      '<p class="empty-state">No results</p>';
    document.getElementById("victory").style.display = "none";
    return;
  }

  const topScore = results[0].total;
  const secondScore = results[1]?.total || 0;

  // Check for victory condition
  if (
    (topScore === 100 && secondScore < 90) ||
    (topScore >= 95 && (results.length === 1 || topScore - secondScore >= 15))
  ) {
    showVictory(results[0].q);
    document.getElementById("resultsSection").style.display = "none";
    return;
  }

  document.getElementById("victory").style.display = "none";
  document.getElementById("resultsSection").style.display = "block";

  document.getElementById("resultsList").innerHTML = results
    .map((r, i) => {
      const preview =
        r.q.question_text.length > 80
          ? r.q.question_text.substring(0, 80) + "..."
          : r.q.question_text;

      const correct =
        r.q.type === "single"
          ? `${r.q.correct[0].answer}: ${r.q.correct[0].text.substring(
              0,
              30
            )}...`
          : r.q.correct
              .map((c) => `${c.row}→${c.col}`)
              .slice(0, 3)
              .join(", ");

      const scoreClass =
        r.total >= 80 ? "high" : r.total >= 50 ? "medium" : "low";

      const clueHits = Object.entries(r.clueScores)
        .map(([idx, score]) => {
          const hitClass =
            score >= 80 ? "high" : score >= 50 ? "medium" : "low";
          return `<span class="clue-hit ${hitClass}">${
            parseInt(idx) + 1
          }</span>`;
        })
        .join("");

      return `
            <div class="result-card" onclick="showQuestion(${i})">
                <div class="result-header">
                    <span class="result-score ${scoreClass}">${Math.round(
        r.total
      )}%</span>
                </div>
                <div class="result-question">${escapeHtml(preview)}</div>
                <div class="result-footer">
                    <span class="result-correct">${escapeHtml(correct)}</span>
                    <div class="result-clues">${clueHits}</div>
                </div>
            </div>
        `;
    })
    .join("");

  // Store results for modal
  window.currentResults = results;
}

function showVictory(q) {
  victoryQuestion = q; // store for click handler

  const victory = document.getElementById("victory");
  victory.style.display = "block";

  let answerHtml;
  if (q.type === "single") {
    const c = q.correct[0];
    answerHtml = `<span class="letter">${c.answer}</span>${escapeHtml(c.text)}`;
  } else {
    answerHtml = q.correct
      .map((c) => `<div>${c.row} → ${c.col}</div>`)
      .join("");
  }

  document.getElementById("victoryAnswer").innerHTML = answerHtml;

  const preview =
    q.question_text.length > 150
      ? q.question_text.substring(0, 150) + "..."
      : q.question_text;
  document.getElementById(
    "victoryContext"
  ).innerHTML = `<strong>Question:</strong> ${escapeHtml(preview)}<br>
      <strong>ID:</strong> ${q.question_id} | <strong>Type:</strong> ${
    q.type
  }<br>
      <span style="color: var(--accent); font-size: 0.9em;">Tap to see full question</span>`;
}

function showVictoryFull() {
  if (!victoryQuestion) return;
  const q = victoryQuestion;
  const modal = document.getElementById("questionModal");

  let correctHtml;
  if (q.type === "single") {
    const c = q.correct[0];
    correctHtml = `<div class="modal-correct-item">${c.answer}: ${escapeHtml(
      c.text
    )}</div>`;
  } else {
    correctHtml = q.correct
      .map(
        (c) =>
          `<div class="modal-correct-item">${c.row} → ${c.col}: ${escapeHtml(
            c.left
          )} → ${escapeHtml(c.right)}</div>`
      )
      .join("");
  }

  // Separate numbers and letters for matching questions
  let optionsHtml = "";
  if (q.type === "matching") {
    const entries = Object.entries(q.options || {});
    const numbers = entries.filter(([key]) => /^\d+$/.test(key));
    const letters = entries.filter(([key]) => !/^\d+$/.test(key));

    optionsHtml = `
      ${numbers
        .map(
          ([key, text]) => `
        <div class="modal-option">
          <span class="key">${key}</span>
          <span>${escapeHtml(text)}</span>
        </div>
      `
        )
        .join("")}
      <div class="modal-separator"></div>
      ${letters
        .map(
          ([key, text]) => `
        <div class="modal-option">
          <span class="key">${key}</span>
          <span>${escapeHtml(text)}</span>
        </div>
      `
        )
        .join("")}
    `;
  } else {
    optionsHtml = Object.entries(q.options || {})
      .map(
        ([key, text]) => `
        <div class="modal-option">
          <span class="key">${key}</span>
          <span>${escapeHtml(text)}</span>
        </div>
      `
      )
      .join("");
  }

  document.getElementById("modalBody").innerHTML = `
     <div class="modal-question">${escapeHtml(q.question_text)}</div>
     <div class="modal-options">
       ${optionsHtml}
     </div>
     <div class="modal-correct">
       <h3>Correct Answer</h3>
       ${correctHtml}
     </div>
     <div class="modal-meta">
       ID: ${q.question_id} | Type: ${q.type} | 
       <a href="${
         q.url
       }" target="_blank" style="color: var(--question)">Open original</a>
     </div>
   `;

  modal.classList.add("active");
}

// ---=== MODAL ===---
function showQuestion(index) {
  const q = window.currentResults[index].q;
  const modal = document.getElementById("questionModal");

  let correctHtml;
  if (q.type === "single") {
    const c = q.correct[0];
    correctHtml = `<div class="modal-correct-item">${c.answer}: ${escapeHtml(
      c.text
    )}</div>`;
  } else {
    correctHtml = q.correct
      .map(
        (c) =>
          `<div class="modal-correct-item">${c.row} → ${c.col}: ${escapeHtml(
            c.left
          )} → ${escapeHtml(c.right)}</div>`
      )
      .join("");
  }

  // Separate numbers and letters for matching questions
  let optionsHtml = "";
  if (q.type === "matching") {
    const entries = Object.entries(q.options || {});
    const numbers = entries.filter(([key]) => /^\d+$/.test(key));
    const letters = entries.filter(([key]) => !/^\d+$/.test(key));

    optionsHtml = `
      ${numbers
        .map(
          ([key, text]) => `
        <div class="modal-option">
          <span class="key">${key}</span>
          <span>${escapeHtml(text)}</span>
        </div>
      `
        )
        .join("")}
      <div class="modal-separator"></div>
      ${letters
        .map(
          ([key, text]) => `
        <div class="modal-option">
          <span class="key">${key}</span>
          <span>${escapeHtml(text)}</span>
        </div>
      `
        )
        .join("")}
    `;
  } else {
    optionsHtml = Object.entries(q.options || {})
      .map(
        ([key, text]) => `
        <div class="modal-option">
          <span class="key">${key}</span>
          <span>${escapeHtml(text)}</span>
        </div>
      `
      )
      .join("");
  }

  document.getElementById("modalBody").innerHTML = `
        <div class="modal-question">${escapeHtml(q.question_text)}</div>
        <div class="modal-options">
            ${optionsHtml}
        </div>
        <div class="modal-correct">
            <h3>Correct Answer</h3>
            ${correctHtml}
        </div>
        <div class="modal-meta">
            ID: ${q.question_id} | Type: ${q.type} | 
            <a href="${
              q.url
            }" target="_blank" style="color: var(--question)">Open original</a>
        </div>
    `;

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("questionModal").classList.remove("active");
}

// ---=== UTILS ===---
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---=== EVENT LISTENERS ===---
document.addEventListener("DOMContentLoaded", init);

document.getElementById("clueText").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addClue("q"); // default to question
  }
});

document.getElementById("questionModal").addEventListener("click", (e) => {
  if (e.target.id === "questionModal") closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
