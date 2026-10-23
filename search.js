import { countries } from "./data.js";

const input = document.getElementById("searchInput");
const list = document.getElementById("suggestions");

function clean(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["'’`´]/g, "")
    .toLowerCase();
}

const countryItems = countries.map(function (item) {
  const name = typeof item === "string" ? item : item.name;
  return { name: name, search: clean(name) };
});

let results = [];
let selected = -1;

function findMatches(text) {
  const q = clean(text).trim();
  if (q === "") return [];

  const matches = [];
  for (let i = 0; i < countryItems.length; i++) {
    const pos = countryItems[i].search.indexOf(q);
    if (pos === -1) continue;

    let score = 2;
    if (pos === 0) score = 0;
    else if (countryItems[i].search[pos - 1] === " ") score = 1;

    matches.push({ name: countryItems[i].name, score: score });
  }

  matches.sort(function (a, b) {
    if (a.score !== b.score) return a.score - b.score;
    return a.name.localeCompare(b.name);
  });

  return matches.slice(0, 10).map(function (m) {
    return m.name;
  });
}

function showResults() {
  list.innerHTML = "";

  results.forEach(function (name, i) {
    const li = document.createElement("li");
    li.textContent = name;
    if (i === selected) li.classList.add("active");
    li.addEventListener("mousedown", function () {
      pick(i);
    });
    list.appendChild(li);
  });

  list.style.display = results.length > 0 ? "block" : "none";
}

function pick(i) {
  if (!results[i]) return;
  input.value = results[i];
  results = [];
  selected = -1;
  showResults();
}

input.addEventListener("input", function () {
  results = findMatches(input.value);
  selected = -1;
  showResults();
});

input.addEventListener("keydown", function (e) {
  if (results.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selected = selected + 1 >= results.length ? 0 : selected + 1;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selected = selected <= 0 ? results.length - 1 : selected - 1;
  } else if (e.key === "Enter") {
    pick(selected === -1 ? 0 : selected);
    return;
  } else if (e.key === "Escape") {
    results = [];
    selected = -1;
  } else {
    return;
  }

  showResults();
});

document.addEventListener("click", function (e) {
  if (e.target !== input) {
    results = [];
    showResults();
  }
});