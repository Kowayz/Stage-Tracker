/* ===== APP.JS — Job Tracker ===== */
"use strict";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "stageTracker_v1";

const STATUSES = [
  "À postuler",
  "Postulé",
  "Relance",
  "Entretien",
  "Test technique",
  "Offre reçue",
  "Refusé",
  "Abandonné",
];

const STATUS_COLORS = {
  "À postuler":    "#BCAAA4",
  Postulé:         "#A1887F",
  Relance:         "#FFB74D",
  Entretien:       "#8D6E63",
  "Test technique":"#795548",
  "Offre reçue":   "#66BB6A",
  Refusé:          "#EF5350",
  Abandonné:       "#D7CCC8",
};

const STATUS_ICONS = {
  "À postuler":    "📝",
  Postulé:         "📨",
  Relance:         "🔔",
  Entretien:       "☕",
  "Test technique":"💻",
  "Offre reçue":   "🎉",
  Refusé:          "⛔",
  Abandonné:       "🗑️",
};

const PRIORITY_ICONS = { Haute: "🔴", Moyenne: "🟡", Basse: "🟢" };


const GOAL_KEY = "stageTracker_goal";

// ─── PROFILE ─────────────────────────────────────────────────────────────────
const PROFILE = {
  name:     "Ethan Geslin",
  initials: "EG",
  links: [
    { sub: "GitHub",   label: "Kowayz",                   href: "https://github.com/Kowayz",                              icon: "github"   },
    { sub: "LinkedIn", label: "Ethan Geslin",              href: "https://www.linkedin.com/in/ethan-geslin-7a5a61387/",    icon: "linkedin" },
    { sub: "Email",    label: "Ethan91330@outlook.com",    href: "mailto:Ethan91330@outlook.com",                         icon: "mail"     },
  ],
};

const LINK_ICONS = {
  github:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  linkedin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  mail:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
};

let fpAppliedDate; // Flatpickr instance
let _prevGoalReached = false;

// ─── STATE ───────────────────────────────────────────────────────────────────
let state = {
  candidatures: [],
  view: "list", // 'list' | 'kanban' | 'timeline'
  sortCol: "appliedDate",
  sortDir: "desc",
  filters: { status: "", sector: "", priority: "", search: "" },
  editId: null,
  deleteId: null,
  presentationMode: false,
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── THEME MANAGER ───────────────────────────────────────────────────────────
const THEME_ICONS = {
  "cafe":          "☕",
  "dark":          "☕",
  "clair":         "🔆",
  "sombre":        "🌑",
  "pistache":      "🌿",
  "pistache-dark": "🌿",
  "ocean":         "🌊",
  "ocean-dark":    "🌊",
  "pastel":        "🌸",
  "pastel-dark":   "🌸",
};

function initTheme() {
  const btn   = document.getElementById("btnThemeToggle");
  const panel = document.getElementById("themePickerPanel");
  const wrap  = document.getElementById("themePickerWrap");
  const saved = localStorage.getItem("theme") || "cafe";
  applyTheme(saved);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = panel.classList.toggle("open");
    panel.setAttribute("aria-hidden", String(!open));
  });

  document.querySelectorAll(".theme-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      const t = swatch.dataset.theme;
      applyTheme(t);
      localStorage.setItem("theme", t);
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    });
  });

  document.addEventListener("click", (e) => {
    if (wrap && !wrap.contains(e.target)) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
  document.querySelectorAll(".theme-swatch").forEach(s => {
    s.classList.toggle("active", s.dataset.theme === theme);
  });
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("btnThemeToggle");
  if (btn) btn.textContent = THEME_ICONS[theme] || "🎨";
}

// ─── BACKUP MANAGER ──────────────────────────────────────────────────────────
function updateLastSaved() {
  localStorage.setItem("lastBackupTime", new Date().toISOString());
}

function checkExportFreshness() {
  const lastExport = localStorage.getItem("lastExportDate");
  if (!lastExport) return; // Never exported? Maybe warn later.
  
  const daysDiff = (new Date() - new Date(lastExport)) / (1000 * 60 * 60 * 24);
  if (daysDiff > 7) {
    setTimeout(() => {
      showToast("⚠️ Pensez à exporter vos données (Excel/JSON) !", "warning", 6000);
    }, 2000);
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.candidatures = raw ? JSON.parse(raw) : [];
  } catch {
    state.candidatures = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.candidatures));
  updateLastSaved();
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.className = "toast";
  }, 3000);
}

// ─── KPI ─────────────────────────────────────────────────────────────────────
function updateKPIs() {
  const all = state.candidatures;
  const active = all.filter(
    (c) => !["Refusé", "Abandonné", "Offre reçue"].includes(c.status),
  );
  const interviews = all.filter(
    (c) => c.status === "Entretien" || c.status === "Test technique",
  );
  const offers = all.filter((c) => c.status === "Offre reçue");
  const rejected = all.filter((c) => c.status === "Refusé");

  animateCount("kpiTotal", all.length);
  animateCount("kpiActive", active.length);
  animateCount("kpiInterview", interviews.length);
  animateCount("kpiOffer", offers.length);
  animateCount("kpiRejected", rejected.length);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  const current = parseInt(el.textContent) || 0;
  const diff = target - current;
  if (diff === 0) return;
  const steps = 20;
  let step = 0;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(current + (diff * step) / steps);
    if (step >= steps) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, 16);
}

// ─── SECTOR FILTER ───────────────────────────────────────────────────────────
function updateSectorFilter() {
  const sectors = [
    ...new Set(state.candidatures.map((c) => c.sector).filter(Boolean)),
  ].sort();
  const sel = document.getElementById("filterSector");
  const current = sel.value;
  sel.innerHTML = '<option value="">Tous les secteurs</option>';
  sectors.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    if (s === current) opt.selected = true;
    sel.appendChild(opt);
  });

  // datalist for form
  const dl = document.getElementById("sectorList");
  dl.innerHTML = "";
  sectors.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    dl.appendChild(opt);
  });
}

// ─── FILTER & SORT ───────────────────────────────────────────────────────────
function getFiltered() {
  let list = [...state.candidatures];
  const { status, sector, priority, search } = state.filters;

  if (status) list = list.filter((c) => c.status === status);
  if (sector) list = list.filter((c) => c.sector === sector);
  if (priority) list = list.filter((c) => c.priority === priority);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.company.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        (c.sector || "").toLowerCase().includes(q) ||
        (c.notes || "").toLowerCase().includes(q),
    );
  }

  // Sort
  list.sort((a, b) => {
    let va = a[state.sortCol] || "";
    let vb = b[state.sortCol] || "";
    if (va < vb) return state.sortDir === "asc" ? -1 : 1;
    if (va > vb) return state.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return list;
}

// ─── RENDER LIST ─────────────────────────────────────────────────────────────
function renderList() {
  const list = getFiltered();
  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("emptyState");

  if (list.length === 0) {
    tbody.innerHTML = "";
    const noData    = document.getElementById("emptyNoData");
    const noResults = document.getElementById("emptyNoResults");
    if (state.candidatures.length === 0) {
      if (noData)    noData.style.display    = "";
      if (noResults) noResults.style.display = "none";
    } else {
      if (noData)    noData.style.display    = "none";
      if (noResults) noResults.style.display = "";
    }
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = list.map((c) => {
    const initial = c.company.charAt(0).toUpperCase();

    const locationHtml = c.location
      ? `<span style="display:inline-flex;align-items:center;gap:5px;">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
           ${escHtml(c.location)}
         </span>`
      : `<span style="color:var(--text-muted)">—</span>`;

    const contactHtml = c.contactName
      ? `<span style="display:inline-flex;align-items:center;gap:5px;">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           ${escHtml(c.contactName)}
         </span>`
      : `<span style="color:var(--text-muted)">—</span>`;

    // Relance badge: si statut "en attente" depuis + de 7 jours
    const daysSince = c.appliedDate
      ? Math.floor((Date.now() - new Date(c.appliedDate + "T00:00:00").getTime()) / 86400000)
      : null;
    const needsRelance = ["Postulé", "Relance"].includes(c.status) && daysSince !== null && daysSince >= 7;
    const relanceBadge = needsRelance
      ? `<span class="relance-badge" title="${daysSince} jours sans réponse">⏰ ${daysSince}j</span>`
      : "";

    return `
    <tr data-status="${escHtml(c.status)}">
      <td class="company-cell">
        <div style="display:flex;align-items:center;gap:11px;">
          <div class="company-logo">${initial}</div>
          <div>
            <div class="cell-company">${escHtml(c.company)}${c.type ? `<span class="type-badge">${escHtml(c.type)}</span>` : ""}</div>
            <div class="cell-position">${escHtml(c.position)}</div>
          </div>
        </div>
      </td>
      <td class="location-cell">${locationHtml}</td>
      <td>${c.sector ? `<span class="sector-badge">${escHtml(c.sector)}</span>` : `<span style="color:var(--text-muted)">—</span>`}</td>
      <td><span class="status-badge status-${slugify(c.status)}">${escHtml(c.status)}</span></td>
      <td><span class="priority-badge priority-${slugify(c.priority)}">${PRIORITY_ICONS[c.priority] || ""} ${escHtml(c.priority)}</span></td>
      <td class="date-cell">${formatDate(c.appliedDate)}${relanceBadge}</td>
      <td class="contact-cell">${contactHtml}</td>
      <td class="actions-cell">
        ${c.link ? `<button class="btn-icon link" onclick="openLink('${escHtml(c.link)}')" title="Voir l'offre">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>` : ""}
        ${c.notes ? `<button class="btn-icon notes" onclick="openNotesModal('${c.id}')" title="Voir les notes">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </button>` : ""}
        <button class="btn-icon edit" onclick="openEdit('${c.id}')" title="Modifier">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon delete" onclick="openDelete('${c.id}')" title="Supprimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join("");
}

// ─── RENDER KANBAN ────────────────────────────────────────────────────────────
function renderKanban() {
  const list = getFiltered();
  const board = document.getElementById("kanbanBoard");

  board.innerHTML = STATUSES.map((status) => {
    const cards = list.filter((c) => c.status === status);
    return `
      <div class="kanban-column" data-status="${escHtml(status)}"
           ondragover="event.preventDefault();this.classList.add('drag-over')"
           ondragleave="this.classList.remove('drag-over')"
           ondrop="dropCard(event,'${escHtml(status)}')">
        <div class="kanban-col-header">
          <span class="kanban-col-title" style="color:${STATUS_COLORS[status]}">
            ${STATUS_ICONS[status]} ${status}
          </span>
          <span class="kanban-col-count">${cards.length}</span>
        </div>
        <div class="kanban-cards">
          ${
            cards.length === 0
              ? '<div style="text-align:center;padding:16px;font-size:12px;color:var(--text-muted)">Aucune</div>'
              : cards
                  .map(
                    (c) => {
                      const initial = c.company.charAt(0).toUpperCase();
                      return `
              <div class="kanban-card" draggable="true" data-id="${c.id}"
                   ondragstart="dragCard(event,'${c.id}')" ondragend="this.classList.remove('dragging')"
                   onclick="openEdit('${c.id}')">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;min-width:0;">
                  <div class="company-logo" style="width:28px;height:28px;font-size:11px;flex-shrink:0;">${initial}</div>
                  <div style="min-width:0;overflow:hidden;flex:1;">
                    <div class="kanban-card-company" style="margin:0">${escHtml(c.company)}</div>
                    <div class="kanban-card-position" style="margin:0">${escHtml(c.position)}</div>
                  </div>
                </div>
                ${c.location ? `<div class="kanban-card-location">📍 ${escHtml(c.location)}</div>` : ""}
                <div class="kanban-card-footer">
                  <span class="kanban-card-date">${formatDate(c.appliedDate)}</span>
                  <div class="kanban-card-actions" onclick="event.stopPropagation()">
                    ${
                      c.link
                        ? `<button class="btn-icon link" onclick="openLink('${escHtml(c.link)}')" title="Voir l'offre">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </button>`
                        : ""
                    }
                    <button class="btn-icon delete" onclick="openDelete('${c.id}')" title="Supprimer">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            `;
                    }
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  }).join("");
}

// ─── RENDER TIMELINE ──────────────────────────────────────────────────────────
function renderTimeline() {
  const list      = getFiltered();
  const container = document.getElementById("timelineContainer");

  if (list.length === 0) {
    container.innerHTML = `<div class="timeline-empty">Aucune candidature à afficher.</div>`;
    return;
  }

  // Sort all by date desc
  const sorted = [...list].sort((a, b) => {
    const da = a.appliedDate || a.createdAt?.slice(0, 10) || "";
    const db = b.appliedDate || b.createdAt?.slice(0, 10) || "";
    return db.localeCompare(da);
  });

  // Group by year-month key
  const groups = {};
  sorted.forEach(c => {
    const raw = c.appliedDate || c.createdAt?.slice(0, 10) || "";
    const key = raw ? raw.slice(0, 7) : "sans-date";
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  container.innerHTML = sortedKeys.map(key => {
    const items = groups[key];
    const label = key === "sans-date" ? "Sans date" : (() => {
      const [year, month] = key.split("-");
      return new Date(+year, +month - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    })();

    return `
      <div class="timeline-group">
        <div class="timeline-month-label">
          ${label} <span class="timeline-count">${items.length}</span>
        </div>
        <div class="timeline-items">
          ${items.map(c => `
            <div class="timeline-item">
              <div class="timeline-dot" style="background:${STATUS_COLORS[c.status] || "var(--border)"}"></div>
              <div class="timeline-card" onclick="openEdit('${c.id}')">
                <div class="timeline-card-top">
                  <div class="timeline-card-company">${escHtml(c.company)}</div>
                  <span class="status-badge status-${slugify(c.status)}">${escHtml(c.status)}</span>
                </div>
                <div class="timeline-card-position">${escHtml(c.position)}</div>
                <div class="timeline-card-meta">
                  ${c.location ? `<span>📍 ${escHtml(c.location)}</span>` : ""}
                  ${c.appliedDate ? `<span>${formatDate(c.appliedDate)}</span>` : ""}
                  ${c.priority ? `<span>${escHtml(c.priority)}</span>` : ""}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>`;
  }).join("");
}

// ─── DRAG & DROP ──────────────────────────────────────────────────────────────
function dragCard(event, id) {
  event.dataTransfer.setData("text/plain", id);
  event.currentTarget.classList.add("dragging");
}

function dropCard(event, newStatus) {
  event.preventDefault();
  const col = event.currentTarget;
  col.classList.remove("drag-over");
  const id = event.dataTransfer.getData("text/plain");
  const c = state.candidatures.find((x) => x.id === id);
  if (c && c.status !== newStatus) {
    c.status = newStatus;
    saveData();
    render();
    showToast(`Déplacé vers "${newStatus}"`, "success");
  }
}


// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  updateKPIs();
  updateSectorFilter();
  if      (state.view === "list")     renderList();
  else if (state.view === "kanban")   renderKanban();
  else if (state.view === "timeline") renderTimeline();
  updateSortHeaders();
  renderGoal();
}

function updateSortHeaders() {
  document.querySelectorAll(".table th.sortable").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.dataset.col === state.sortCol) {
      th.classList.add(state.sortDir === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}

// ─── MODAL ADD/EDIT ───────────────────────────────────────────────────────────
function openAdd() {
  state.editId = null;
  document.getElementById("modalTitle").textContent = "Nouvelle candidature";
  document.getElementById("formSubmit").textContent = "Ajouter";
  document.getElementById("candidatureForm").reset();
  document.getElementById("formId").value = "";
  if (fpAppliedDate) fpAppliedDate.setDate(new Date(), false);
  openModal("modalOverlay");
}

function openEdit(id) {
  const c = state.candidatures.find((x) => x.id === id);
  if (!c) return;
  state.editId = id;
  document.getElementById("modalTitle").textContent = "Modifier la candidature";
  document.getElementById("formSubmit").textContent = "Enregistrer";
  document.getElementById("formId").value = c.id;
  document.getElementById("formCompany").value = c.company || "";
  document.getElementById("formPosition").value = c.position || "";
  document.getElementById("formLocation").value = c.location || "";
  document.getElementById("formSector").value = c.sector || "";
  document.getElementById("formType").value = c.type || "Stage";
  document.getElementById("formStatus").value = c.status || "Postulé";
  document.getElementById("formPriority").value = c.priority || "Moyenne";
  if (fpAppliedDate) fpAppliedDate.setDate(c.appliedDate || null, false);
  document.getElementById("formLink").value = c.link || "";
  document.getElementById("formContactName").value = c.contactName || "";
  document.getElementById("formContactEmail").value = c.contactEmail || "";
  document.getElementById("formNotes").value = c.notes || "";
  openModal("modalOverlay");
}

function closeAdd() {
  closeModal("modalOverlay");
}

function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
}

// ─── MODAL DELETE ─────────────────────────────────────────────────────────────
function openDelete(id) {
  const c = state.candidatures.find((x) => x.id === id);
  if (!c) return;
  state.deleteId = id;
  document.getElementById("deleteCompanyName").textContent = c.company;
  openModal("deleteOverlay");
}

function closeDelete() {
  closeModal("deleteOverlay");
  state.deleteId = null;
}

function confirmDelete() {
  if (!state.deleteId) return;
  const idx = state.candidatures.findIndex((c) => c.id === state.deleteId);
  if (idx !== -1) {
    const name = state.candidatures[idx].company;
    state.candidatures.splice(idx, 1);
    saveData();
    render();
    showToast(`Candidature chez ${name} supprimée.`, "error");
  }
  closeDelete();
}

// ─── FORM SUBMIT ──────────────────────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const company = document.getElementById("formCompany").value.trim();
  const position = document.getElementById("formPosition").value.trim();
  if (!company || !position) {
    showToast("Entreprise et poste sont requis.", "error");
    return;
  }

  const data = {
    company,
    position,
    location:     document.getElementById("formLocation").value.trim(),
    sector: document.getElementById("formSector").value.trim(),

    type: document.getElementById("formType").value,
    status: document.getElementById("formStatus").value,
    priority: document.getElementById("formPriority").value,
    appliedDate: document.getElementById("formAppliedDate").value,
    link: document.getElementById("formLink").value.trim(),
    contactName: document.getElementById("formContactName").value.trim(),
    contactEmail: document.getElementById("formContactEmail").value.trim(),
    notes: document.getElementById("formNotes").value.trim(),
  };

  if (state.editId) {
    const idx = state.candidatures.findIndex((c) => c.id === state.editId);
    if (idx !== -1) {
      state.candidatures[idx] = { ...state.candidatures[idx], ...data };
      showToast(`Candidature chez ${company} mise à jour !`, "success");
    }
  } else {
    state.candidatures.unshift({
      id: uid(),
      createdAt: new Date().toISOString(),
      ...data,
    });
    showToast(`Candidature chez ${company} ajoutée !`, "success");
  }

  saveData();
  render();
  closeAdd();
}

// ─── EXPORT EXCEL ─────────────────────────────────────────────────────────────
function exportExcel() {
  const today = new Date().toLocaleDateString('fr-FR');
  localStorage.setItem("lastExportDate", new Date().toISOString());
  
  // Calculate Stats
  const total = state.candidatures.length;
  const inProgress = state.candidatures.filter(c => ['En attente', 'Postulé', 'Relance'].some(s => c.status.includes(s))).length;
  const interviews = state.candidatures.filter(c => ['Entretien', 'Technique'].some(s => c.status.includes(s))).length;
  const offers = state.candidatures.filter(c => c.status.includes('Offre')).length;

  const styles = `
    <style>
      body { font-family: 'Calibri', sans-serif; background: #ffffff; }
      .main-title { font-size: 20px; font-weight: bold; color: #1e293b; text-align: center; padding: 20px; }
      
      /* Summary Table */
      .summary-table { margin-bottom: 20px; border-collapse: collapse; }
      .summary-th { background: #f1f5f9; color: #475569; padding: 8px 16px; border: 1px solid #cbd5e1; font-weight: bold; }
      .summary-td { padding: 8px 16px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0f766e; }

      /* Main Table */
      table.data-table { border-collapse: collapse; width: 100%; border: 2px solid #0f766e; }
      
      th { 
        background-color: #0f766e; /* Teal */
        color: #ffffff; 
        padding: 12px 8px; 
        text-align: center; 
        font-weight: bold; 
        border: 1px solid #0d9488;
        font-size: 12px;
      }
      
      td { 
        padding: 8px; 
        border: 1px solid #e2e8f0; 
        vertical-align: middle; 
        font-size: 11px;
        color: #334155;
      }
      
      /* Zebra Striping */
      tr:nth-child(even) { background-color: #f8fafc; }
      tr:hover { background-color: #f1f5f9; }
      
      /* Column Specifics */
      .col-company { font-weight: bold; color: #1e293b; font-size: 12px; }
      .col-status  { text-align: center; }
      .col-date    { text-align: center; color: #64748b; }
      
      /* Badges */
      .badge { 
        display: inline-block; 
        padding: 4px 12px; 
        border-radius: 12px; 
        font-size: 10px; 
        font-weight: bold; 
        text-align: center;
        border: 1px solid transparent;
        color: #333; /* Fallback */
      }
      
      .status-a-postuler     { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
      .status-postule        { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .status-relance        { background-color: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
      .status-entretien      { background-color: #f5f3ff; color: #7e22ce; border: 1px solid #ddd6fe; }
      .status-test-technique { background-color: #ecfeff; color: #0e7490; border: 1px solid #a5f3fc; }
      .status-offre-recue    { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
      .status-refuse         { background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
      .status-abandonne      { background-color: #f9fafb; color: #9ca3af; text-decoration: line-through; }
      
      .loc-pill { font-weight: bold; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; display:inline-block; }
    </style>
  `;

  let tableConfig = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Suivi Candidatures</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:Panes>
                  <x:Pane>
                    <x:Number>3</x:Number>
                    <x:ActiveRow>5</x:ActiveRow>
                  </x:Pane>
                </x:Panes>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      ${styles}
    </head>
    <body>
    
    <!-- Title -->
    <div class="main-title">SUIVI DE CANDIDATURES DU ${today}</div>
    <br>

    <!-- Summary Stats -->
    <table class="summary-table">
      <tr>
        <th class="summary-th">Total</th>
        <th class="summary-th">En cours</th>
        <th class="summary-th">Entretiens</th>
        <th class="summary-th">Offres</th>
      </tr>
      <tr>
        <td class="summary-td">${total}</td>
        <td class="summary-td">${inProgress}</td>
        <td class="summary-td">${interviews}</td>
        <td class="summary-td" style="color:${offers > 0 ? '#16a34a' : 'inherit'}">${offers}</td>
      </tr>
    </table>
    <br>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width:200px">Entreprise</th>
          <th style="width:250px">Poste</th>
          <th style="width:120px">Lieu</th>
          <th style="width:120px">Secteur</th>
          <th style="width:140px">Statut</th>
          <th style="width:80px">Priorité</th>
          <th style="width:100px">Date</th>
          <th style="width:60px">Lien</th>
          <th style="width:150px">Contact</th>
          <th style="width:300px">Notes</th>
        </tr>
      </thead>
      <tbody>
  `;

  state.candidatures.forEach(c => {
    const statusClass = `status-${slugify(c.status)}`;
    const statusHtml = `<span class="badge ${statusClass}">${escHtml(c.status)}</span>`;

    tableConfig += `
      <tr>
        <td class="col-company">${escHtml(c.company)}</td>
        <td>${escHtml(c.position)}</td>
        <td>${c.location ? `<span class="loc-pill">${escHtml(c.location)}</span>` : ""}</td>
        <td>${escHtml(c.sector)}</td>
        <td class="col-status">${statusHtml}</td>
        <td style="text-align:center">${escHtml(c.priority)}</td>
        <td class="col-date">${c.appliedDate || ""}</td>
        <td style="text-align:center">${c.link ? `<a href="${escHtml(c.link)}" style="color:#0f766e;font-weight:bold;text-decoration:none">🔗 Voir</a>` : ""}</td>
        <td>${escHtml(c.contactName || "")}</td>
        <td><div style="max-height:60px; overflow:hidden;">${escHtml(c.notes || "")}</div></td>
      </tr>
    `;
  });

  tableConfig += `
      </tbody>
    </table>
    <br>
    <div style="font-size:10px; color:#94a3b8; font-style:italic">Généré par Job Tracker le ${new Date().toLocaleString()}</div>
    </body>
    </html>
  `;

  const blob = new Blob([tableConfig], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Suivi_Candidatures_${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Export Excel amélioré téléchargé !", "success");
}

// ─── EXPORT PDF ───────────────────────────────────────────────────────────────
function exportPDF() {
  if (!window.jspdf) {
    showToast("Librairie PDF non chargée, réessayez.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc  = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const list = state.candidatures;
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const W = doc.internal.pageSize.getWidth();

  // ── Bandeau titre ──
  doc.setFillColor(62, 42, 41);
  doc.rect(0, 0, W, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Job Tracker", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Rapport de suivi des candidatures", 14, 19);
  doc.text(`Généré le ${today}`, W - 14, 19, { align: "right" });

  // ── KPI strip ──
  const total      = list.length;
  const enCours    = list.filter(c => !["Refusé","Abandonné","Offre reçue"].includes(c.status)).length;
  const entretiens = list.filter(c => ["Entretien","Test technique"].includes(c.status)).length;
  const offres     = list.filter(c => c.status === "Offre reçue").length;
  const refus      = list.filter(c => c.status === "Refusé").length;

  const kpis = [
    { label: "Total",      value: total,      color: [62, 42, 41] },
    { label: "En cours",   value: enCours,    color: [62, 42, 41] },
    { label: "Entretiens", value: entretiens, color: [109, 40, 217] },
    { label: "Offres",     value: offres,     color: offres  > 0 ? [21, 128, 61]  : [62, 42, 41] },
    { label: "Refus",      value: refus,      color: refus   > 0 ? [185, 28, 28]  : [62, 42, 41] },
  ];
  const boxW = (W - 28 - (kpis.length - 1) * 4) / kpis.length;
  kpis.forEach((k, i) => {
    const x = 14 + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, 26, boxW, 16, 3, 3, "FD");
    doc.setTextColor(...k.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(String(k.value), x + boxW / 2, 36, { align: "center" });
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(k.label.toUpperCase(), x + boxW / 2, 40, { align: "center" });
  });

  // ── Tableau ──
  const statusFill = {
    "À postuler":    [241, 245, 249], "Postulé":       [239, 246, 255],
    "Relance":       [255, 247, 237], "Entretien":     [245, 243, 255],
    "Test technique":[236, 254, 255], "Offre reçue":   [240, 253, 244],
    "Refusé":        [254, 242, 242], "Abandonné":     [249, 250, 251],
  };
  const statusText = {
    "À postuler":    [100, 116, 139], "Postulé":       [29, 78, 216],
    "Relance":       [194, 65, 12],   "Entretien":     [126, 34, 206],
    "Test technique":[14, 116, 144],  "Offre reçue":   [21, 128, 61],
    "Refusé":        [185, 28, 28],   "Abandonné":     [156, 163, 175],
  };

  const tableRows = list.map(c => {
    const daysSince = c.appliedDate
      ? Math.floor((Date.now() - new Date(c.appliedDate + "T00:00:00").getTime()) / 86400000)
      : null;
    const relance = ["Postulé","Relance"].includes(c.status) && daysSince >= 7 ? ` ⏰${daysSince}j` : "";
    const dateStr = c.appliedDate
      ? new Date(c.appliedDate + "T00:00:00").toLocaleDateString("fr-FR") + relance
      : "—";
    return [c.company, c.position, c.location || "—", c.status, c.priority || "—", dateStr, c.notes || "—"];
  });

  doc.autoTable({
    head: [["Entreprise", "Poste", "Lieu", "Statut", "Priorité", "Date", "Notes"]],
    body: tableRows,
    startY: 46,
    margin: { left: 14, right: 14 },
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3.5, overflow: "ellipsize", halign: "left" },
    headStyles: { fillColor: [62, 42, 41], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8, halign: "left" },
    alternateRowStyles: { fillColor: [250, 248, 246] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38 },
      1: { cellWidth: 46 },
      2: { cellWidth: 30, textColor: [100, 116, 139] },
      3: { cellWidth: 28 },
      4: { cellWidth: 20, halign: "center" },
      5: { cellWidth: 26, halign: "center", textColor: [100, 116, 139] },
      6: { cellWidth: "auto", textColor: [148, 163, 184] },
    },
    didDrawCell(data) {
      // Colorise la cellule Statut avec un pill
      if (data.section === "body" && data.column.index === 3) {
        const status = data.cell.raw;
        const fill = statusFill[status] || [248, 250, 252];
        const text = statusText[status] || [51, 65, 85];
        const { x, y, width: w, height: h } = data.cell;
        doc.setFillColor(...fill);
        doc.roundedRect(x + 1, y + 1.5, w - 2, h - 3, 2, 2, "F");
        doc.setTextColor(...text);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text(status, x + w / 2, y + h / 2 + 1, { align: "center" });
      }
    },
  });

  // ── Pied de page ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const yFoot = doc.internal.pageSize.getHeight() - 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yFoot - 3, W - 14, yFoot - 3);
    doc.setTextColor(203, 213, 225);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Job Tracker — github.com/Kowayz/Stage-Tracker", 14, yFoot);
    doc.text(`Page ${p} / ${pageCount}`, W - 14, yFoot, { align: "right" });
  }

  doc.save(`Job_Tracker_${new Date().toISOString().slice(0, 10)}.pdf`);
  showToast("PDF téléchargé !", "success");
}

// ─── OPEN LINK ────────────────────────────────────────────────────────────────
function openLink(url) {
  if (url) window.open(url, "_blank", "noopener");
}


// ─── SORT ─────────────────────────────────────────────────────────────────────
function handleSort(col) {
  if (state.sortCol === col) {
    state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  } else {
    state.sortCol = col;
    state.sortDir = "asc";
  }
  render();
}

// ─── HEADER DATE ─────────────────────────────────────────────────────────────
function updateHeaderDate() {
  const el = document.getElementById("headerDate");
  const now = new Date();
  el.textContent = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── VIEW TOGGLE ──────────────────────────────────────────────────────────────
function setView(v) {
  if (document.startViewTransition) {
    document.startViewTransition(() => updateViewDOM(v));
  } else {
    updateViewDOM(v);
  }
}

function updateViewDOM(v) {
  state.view = v;
  const listSection     = document.getElementById("listView");
  const kanbanSection   = document.getElementById("kanbanView");
  const timelineSection = document.getElementById("timelineView");
  const btnList     = document.getElementById("btnListView");
  const btnKanban   = document.getElementById("btnKanbanView");
  const btnTimeline = document.getElementById("btnTimelineView");

  listSection.style.display     = v === "list"     ? "" : "none";
  kanbanSection.style.display   = v === "kanban"   ? "" : "none";
  timelineSection.style.display = v === "timeline" ? "" : "none";

  btnList?.classList.toggle("active",     v === "list");
  btnKanban?.classList.toggle("active",   v === "kanban");
  btnTimeline?.classList.toggle("active", v === "timeline");

  render();
}

// ─── GOAL ────────────────────────────────────────────────────────────────────
function getGoalData() {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && "period" in parsed) return parsed;
    }
  } catch (_) {}
  return { period: "month", day: 2, week: 10, month: 30 };
}

function saveGoalData(data) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(data));
}

function countInPeriod(period) {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (period === "day") {
    return state.candidatures.filter(c => (c.appliedDate || "").slice(0, 10) === today).length;
  }
  if (period === "week") {
    const day  = now.getDay();
    const diff = day === 0 ? -6 : 1 - day; // back to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const mondayStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    return state.candidatures.filter(c => {
      const d = (c.appliedDate || "").slice(0, 10);
      return d >= mondayStr && d <= today;
    }).length;
  }
  // month
  const monthPrefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  return state.candidatures.filter(c => (c.appliedDate || "").slice(0, 7) === monthPrefix).length;
}

function renderGoal() {
  const data   = getGoalData();
  const period = data.period;
  const target = data[period] || 1;
  const count  = countInPeriod(period);
  const pct    = Math.min(100, Math.round((count / target) * 100));

  const elCurrent = document.getElementById("goalCurrent");
  const elTarget  = document.getElementById("goalTargetVal");
  const elBar     = document.getElementById("goalBar");
  const elPct     = document.getElementById("goalPercent");
  const elUnit    = document.getElementById("goalUnit");
  const card      = document.getElementById("goalCard");

  if (elCurrent) elCurrent.textContent = count;
  if (elTarget && !document.querySelector(".goal-edit-input")) elTarget.textContent = target;
  if (elBar)    elBar.style.width = pct + "%";
  if (elPct)    elPct.textContent = pct + "%";
  if (elUnit)   elUnit.textContent = period === "day" ? "aujourd'hui" : period === "week" ? "cette semaine" : "ce mois";

  const isReached = pct >= 100;
  if (card) card.classList.toggle("goal-reached", isReached);

  // Confetti uniquement au moment où l'objectif est atteint
  if (isReached && !_prevGoalReached) {
    launchConfetti();
    showToast("🎉 Objectif atteint !", "success");
  }
  _prevGoalReached = isReached;

  document.querySelectorAll(".goal-period-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.period === period);
  });
}

function initGoal() {
  renderGoal();

  document.querySelectorAll(".goal-period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = getGoalData();
      data.period = btn.dataset.period;
      saveGoalData(data);
      renderGoal();
    });
  });

  const targetEl = document.getElementById("goalTargetVal");
  if (!targetEl) return;

  targetEl.addEventListener("click", () => {
    if (document.querySelector(".goal-edit-input")) return;
    const data   = getGoalData();
    const period = data.period;
    const input  = document.createElement("input");
    input.type      = "number";
    input.min       = "1";
    input.max       = "999";
    input.value     = data[period] || 1;
    input.className = "goal-edit-input";
    targetEl.replaceWith(input);
    input.focus();
    input.select();

    function save() {
      const val = Math.max(1, parseInt(input.value) || 1);
      const d   = getGoalData();
      d[period] = val;
      saveGoalData(d);
      input.replaceWith(targetEl);
      renderGoal();
    }
    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter")  { e.preventDefault(); save(); }
      if (e.key === "Escape") { input.replaceWith(targetEl); }
    });
  });
}

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById("confettiContainer");
  if (!container) return;
  const colors = ["#3E2A29", "#A1887F", "#66BB6A", "#FFB74D", "#8D6E63", "#DEC7BE", "#EF5350", "#3b82f6"];
  container.innerHTML = "";
  for (let i = 0; i < 70; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.cssText = [
      `left:${(Math.random() * 100).toFixed(1)}%`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `animation-delay:${(Math.random() * 0.7).toFixed(2)}s`,
      `animation-duration:${(1.2 + Math.random() * 1.4).toFixed(2)}s`,
      `width:${(4 + Math.random() * 7).toFixed(0)}px`,
      `height:${(4 + Math.random() * 7).toFixed(0)}px`,
      `border-radius:${Math.random() > 0.5 ? "50%" : "2px"}`,
      `transform:rotate(${(Math.random() * 360).toFixed(0)}deg)`,
    ].join(";");
    container.appendChild(p);
  }
  setTimeout(() => { container.innerHTML = ""; }, 2800);
}

// ─── NOTES MODAL ─────────────────────────────────────────────────────────────
function openNotesModal(id) {
  const c = state.candidatures.find(x => x.id === id);
  if (!c || !c.notes) return;

  document.getElementById("notesTitle").textContent = c.company;
  document.getElementById("notesCompany").textContent = c.position;
  document.getElementById("notesBody").innerHTML =
    `<p>${escHtml(c.notes)}</p>`;

  const editBtn = document.getElementById("notesBtnEdit");
  if (editBtn) editBtn.onclick = () => { closeNotesModal(); openEdit(id); };

  openModal("notesOverlay");
}

function closeNotesModal() {
  closeModal("notesOverlay");
}

// ─── PRESENTATION MODE ────────────────────────────────────────────────────────
function initPresentation() {
  const btn     = document.getElementById("btnPresentation");
  const btnQuit = document.getElementById("btnQuitPresentation");
  if (btn)     btn.addEventListener("click",     () => togglePresentation(true));
  if (btnQuit) btnQuit.addEventListener("click", () => togglePresentation(false));
}

function togglePresentation(active) {
  state.presentationMode = active;
  document.body.classList.toggle("presentation-mode", active);
  const banner = document.getElementById("presentationBanner");
  const btn    = document.getElementById("btnPresentation");
  if (banner) banner.style.display = active ? "flex" : "none";
  if (btn)    btn.classList.toggle("active", active);
}

// ─── PROFILE PANEL ───────────────────────────────────────────────────────────
function initProfilePanel() {
  const btn     = document.getElementById("btnProfile");
  const panel   = document.getElementById("profilePanel");
  const overlay = document.getElementById("profileOverlay");
  const close   = document.getElementById("profileClose");
  const body    = document.getElementById("profileBody");

  body.innerHTML = `
    <div class="profile-avatar">${PROFILE.initials}</div>
    <h3 class="profile-name">${PROFILE.name}</h3>
    <div class="profile-divider"></div>
    <div class="profile-links">
      ${PROFILE.links.map(l => `
        <a href="${l.href}" class="profile-link"${l.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>
          ${LINK_ICONS[l.icon]}
          <span class="profile-link-text">
            <span class="profile-link-sub">${l.sub}</span>
            <span class="profile-link-label">${l.label}</span>
          </span>
        </a>
      `).join("")}
    </div>
  `;

  function openPanel() {
    panel.classList.add("open");
    overlay.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closePanel() {
    panel.classList.remove("open");
    overlay.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", openPanel);
  close.addEventListener("click", closePanel);
  overlay.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });
}

// ─── MAIL FAB ────────────────────────────────────────────────────────────────
function initMailFab() {
  const fab   = document.getElementById("mailFab");
  const panel = document.getElementById("mailFabPanel");
  if (!fab || !panel) return;

  function open()  { panel.classList.add("open"); fab.classList.add("open"); panel.removeAttribute("aria-hidden"); }
  function close() { panel.classList.remove("open"); fab.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); }
  function toggle() { panel.classList.contains("open") ? close() : open(); }

  fab.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#mailFabWrap")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

// ─── INIT ──────────────────────────────────────────────────────────────────
function init() {
  loadData();
  initTheme();
  initGoal();
  initMailFab();
  initProfilePanel();
  initPresentation();
  updateHeaderDate();
  render();

  try {
    fpAppliedDate = flatpickr("#formAppliedDateWrap", {
      locale: "fr",
      dateFormat: "Y-m-d",
      disableMobile: true,
      wrap: true,
      static: true,
    });
  } catch (e) {
    console.warn("Flatpickr non chargé, sélecteur de date désactivé.", e);
  }
  checkExportFreshness(); // Backup Alert

  // Header buttons
  document.getElementById("btnAdd").addEventListener("click", openAdd);

  // View toggle
  document.getElementById("btnListView")?.addEventListener("click",     () => setView("list"));
  document.getElementById("btnKanbanView")?.addEventListener("click",   () => setView("kanban"));
  document.getElementById("btnTimelineView")?.addEventListener("click", () => setView("timeline"));

  // Filters
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    render();
  });
  document.getElementById("filterStatus").addEventListener("change", (e) => {
    state.filters.status = e.target.value;
    render();
  });
  document.getElementById("filterSector").addEventListener("change", (e) => {
    state.filters.sector = e.target.value;
    render();
  });
  document.getElementById("filterPriority").addEventListener("change", (e) => {
    state.filters.priority = e.target.value;
    render();
  });
  document.getElementById("btnClearFilters").addEventListener("click", () => {
    state.filters = { status: "", sector: "", priority: "", search: "" };
    document.getElementById("searchInput").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterSector").value = "";
    document.getElementById("filterPriority").value = "";
    render();
  });

  // Sort headers
  document.querySelectorAll(".table th.sortable").forEach((th) => {
    th.addEventListener("click", () => handleSort(th.dataset.col));
  });

  // Modal form
  document
    .getElementById("candidatureForm")
    .addEventListener("submit", handleFormSubmit);
  document.getElementById("modalClose").addEventListener("click", closeAdd);
  document.getElementById("formCancel").addEventListener("click", closeAdd);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeAdd();
  });

  // Delete modal
  document.getElementById("deleteClose").addEventListener("click", closeDelete);
  document
    .getElementById("deleteCancelBtn")
    .addEventListener("click", closeDelete);
  document
    .getElementById("deleteConfirmBtn")
    .addEventListener("click", confirmDelete);
  document.getElementById("deleteOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("deleteOverlay")) closeDelete();
  });

  // Notes modal
  document.getElementById("notesClose")?.addEventListener("click", closeNotesModal);
  document.getElementById("notesBtnClose")?.addEventListener("click", closeNotesModal);
  document.getElementById("notesOverlay")?.addEventListener("click", e => {
    if (e.target === document.getElementById("notesOverlay")) closeNotesModal();
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    const isEditing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || document.activeElement?.isContentEditable;
    const anyOpen   = document.querySelector(".modal-overlay.open") ||
                      document.getElementById("profilePanel")?.classList.contains("open");

    if (e.key === "Escape") {
      closeAdd();
      closeDelete();
      closeNotesModal();
      if (state.presentationMode) togglePresentation(false);
    }

    if (!isEditing && !anyOpen) {
      if ((e.key === "n" || e.key === "N") && !state.presentationMode) {
        e.preventDefault();
        openAdd();
      }
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("searchInput")?.focus();
      }
    }
  });

}

// ─── DATA MANAGEMENT ──────────────────────────────────────────────────────────
function initDataManagement() {
  const btnData = document.getElementById("btnData");
  const closeData = document.getElementById("dataClose");
  
  if(btnData) btnData.addEventListener("click", () => openModal("dataModalOverlay"));
  if(closeData) closeData.addEventListener("click", () => closeModal("dataModalOverlay"));

  const btnExpJSON = document.getElementById("btnExportJSON");
  if(btnExpJSON) btnExpJSON.addEventListener("click", exportJSON);
  
  const btnImpJSON = document.getElementById("btnImportJSON");
  if(btnImpJSON) btnImpJSON.addEventListener("click", () => document.getElementById("importFile").click());
  
  const impFile = document.getElementById("importFile");
  if(impFile) impFile.addEventListener("change", importJSON);
  
  const btnExpCSV = document.getElementById("btnExportCSV");
  if(btnExpCSV) btnExpCSV.addEventListener("click", exportExcel);

  const btnExpPDF = document.getElementById("btnExportPDF");
  if(btnExpPDF) btnExpPDF.addEventListener("click", exportPDF);
}

function exportJSON() {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `job_tracker_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Sauvegarde JSON téléchargée !", "success");
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      if (json.candidatures && Array.isArray(json.candidatures)) {
        state = json;
        saveData();
        render();
        closeModal("dataModalOverlay");
        showToast("Données restaurées avec succès !", "success");
      } else {
        throw new Error("Format invalide");
      }
    } catch (err) {
      showToast("Erreur lors de l'import : Fichier invalide", "error");
      console.error(err);
    }
    e.target.value = ""; // Reset input
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  initDataManagement();
});
