const STORAGE_KEY = "sipfit:mvp:v1";
const DAILY_GOAL_ML = 2800;
const OZ_TO_ML = 29.5735;

const presets = [
  { brand: "Owala", model: "FreeSip", capacityOz: 24 },
  { brand: "Owala", model: "FreeSip", capacityOz: 32 },
  { brand: "Owala", model: "FreeSip", capacityOz: 40 },
  { brand: "YETI", model: "Rambler", capacityOz: 18 },
  { brand: "YETI", model: "Rambler", capacityOz: 26 },
  { brand: "YETI", model: "Rambler", capacityOz: 36 },
  { brand: "YETI", model: "Rambler", capacityOz: 46 },
];

const drinkTypes = [
  { id: "water", label: "Water", action: "Wash", dueHours: 24 },
  { id: "electrolytes", label: "Electrolytes", action: "Wash", dueHours: 12 },
  { id: "protein", label: "Protein", action: "Rinse", dueHours: 2, hotDueHours: 1 },
  { id: "coffee", label: "Coffee/Tea", action: "Wash", dueHours: 12 },
  { id: "sugary", label: "Sugary drink", action: "Wash", dueHours: 8 },
  { id: "other", label: "Other", action: "Wash", dueHours: 24 },
];

const checklistByBrand = {
  owala: ["Bottle body", "Lid", "Straw", "Spout gasket", "Button area"],
  yeti: ["Bottle body", "Chug cap", "MagSlider", "Gasket", "Thread area"],
  other: ["Bottle body", "Lid", "Straw or spout", "Gasket", "Thread area"],
};

let state = loadState();
let selectedDrinkType = "water";
let selectedFraction = 1;
let selectedCleanType = state.settings?.cleanType || "wash";
let toastTimer = null;

const els = {
  pageTitle: document.querySelector("#page-title"),
  notifyButton: document.querySelector("#notify-button"),
  todayTotalOz: document.querySelector("#today-total-oz"),
  todayGoalOz: document.querySelector("#today-goal-oz"),
  todayTotalMl: document.querySelector("#today-total-ml"),
  hydrationProgress: document.querySelector("#hydration-progress"),
  hydrationChart: document.querySelector("#hydration-chart"),
  chartSummary: document.querySelector("#chart-summary"),
  unitButtons: document.querySelectorAll("[data-display-unit]"),
  todayPup: document.querySelector("#today-pup"),
  todayPupMessage: document.querySelector("#today-pup-message"),
  activeBottleName: document.querySelector("#active-bottle-name"),
  activeStatus: document.querySelector("#active-status"),
  activeBottleMeta: document.querySelector("#active-bottle-meta"),
  drinkTypeGrid: document.querySelector("#drink-type-grid"),
  undoButton: document.querySelector("#undo-button"),
  logHelper: document.querySelector("#log-helper"),
  weatherTitle: document.querySelector("#weather-title"),
  weatherCopy: document.querySelector("#weather-copy"),
  weatherButton: document.querySelector("#weather-button"),
  cityForm: document.querySelector("#city-form"),
  cityInput: document.querySelector("#city-input"),
  presetSelect: document.querySelector("#preset-select"),
  bottleForm: document.querySelector("#bottle-form"),
  brandInput: document.querySelector("#brand-input"),
  modelInput: document.querySelector("#model-input"),
  capacityInput: document.querySelector("#capacity-input"),
  unitSelect: document.querySelector("#unit-select"),
  colorInput: document.querySelector("#color-input"),
  seedButton: document.querySelector("#seed-button"),
  bottleList: document.querySelector("#bottle-list"),
  cleanBottleName: document.querySelector("#clean-bottle-name"),
  cleanStatus: document.querySelector("#clean-status"),
  cleanReason: document.querySelector("#clean-reason"),
  cleanPup: document.querySelector("#clean-pup"),
  cleanPupMessage: document.querySelector("#clean-pup-message"),
  bottleVisual: document.querySelector("#bottle-visual"),
  activePartLabel: document.querySelector("#active-part-label"),
  cleanChecklist: document.querySelector("#clean-checklist"),
  cleanLevelDesc: document.querySelector("#clean-level-desc"),
  saveCleanButton: document.querySelector("#save-clean-button"),
  undoCleanButton: document.querySelector("#undo-clean-button"),
  cleanHelper: document.querySelector("#clean-helper"),
  cleanHistory: document.querySelector("#clean-history"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  ensureDefaultState();
  bindNavigation();
  bindDrinkTypes();
  bindLogButtons();
  bindUndo();
  bindBottleForm();
  bindCleanButtons();
  bindCleanUndo();
  bindUnitPreference();
  bindWeather();
  bindNotifications();
  renderPresetOptions();
  render();
  maybeNotifyRisk();
  window.setInterval(maybeNotifyRisk, 5 * 60 * 1000);
}

function ensureDefaultState() {
  if (!state.bottles.length && !state.hasSeeded) {
    const now = new Date().toISOString();
    state.bottles = [makeBottle("Owala", "FreeSip", 32, "oz", "Coastal blue"), makeBottle("YETI", "Rambler", 36, "oz", "Graphite")];
    state.activeBottleId = state.bottles[0].id;
    state.cleanLogs = state.bottles.map((bottle) => ({
      id: crypto.randomUUID(),
      bottleId: bottle.id,
      type: "wash",
      parts: getChecklistParts(bottle),
      createdAt: now,
    }));
    state.hasSeeded = true;
    saveState();
  }
}

function bindNavigation() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`#${tab.dataset.view}`).classList.add("active");
      els.pageTitle.textContent = tab.textContent;
    });
  });
}

function bindDrinkTypes() {
  els.drinkTypeGrid.innerHTML = "";
  drinkTypes.forEach((drink) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `drink-type${drink.id === selectedDrinkType ? " active" : ""}`;
    button.textContent = drink.label;
    button.addEventListener("click", () => {
      selectedDrinkType = drink.id;
      renderDrinkTypeButtons();
    });
    els.drinkTypeGrid.append(button);
  });
}

function renderDrinkTypeButtons() {
  els.drinkTypeGrid.querySelectorAll(".drink-type").forEach((button, index) => {
    button.classList.toggle("active", drinkTypes[index].id === selectedDrinkType);
  });
}

function renderUnitButtons() {
  const unit = getDisplayUnit();
  els.unitButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.displayUnit === unit);
  });
}

function bindLogButtons() {
  document.querySelectorAll("[data-fraction]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFraction = Number(button.dataset.fraction);
      renderFractionButtons();
      const bottle = getActiveBottle();
      if (!bottle) {
        els.logHelper.textContent = "Add a bottle before logging hydration.";
        return;
      }

      const fraction = selectedFraction;
      const amountMl = Math.round(bottle.capacityMl * fraction);
      state.sipLogs.push({
        id: crypto.randomUUID(),
        bottleId: bottle.id,
        amountMl,
        fraction,
        drinkType: selectedDrinkType,
        createdAt: new Date().toISOString(),
      });
      state.undoStack = [
        {
          type: "sip",
          logId: state.sipLogs.at(-1).id,
          label: `${formatFraction(fraction)} ${bottle.brand} ${bottle.model}`,
        },
      ];
      saveState();
      render();
      maybeNotifyRisk();
      els.logHelper.textContent = `Logged ${formatFraction(fraction)} ${bottle.brand} ${bottle.model}.`;
      showToast(`Logged ${formatAmountLabel(amountMl)} ${drinkLabel(selectedDrinkType)}`);
    });
  });
  renderFractionButtons();
}

function renderFractionButtons() {
  document.querySelectorAll("[data-fraction]").forEach((button) => {
    const isActive = Number(button.dataset.fraction) === selectedFraction;
    button.classList.toggle("selected-action", isActive);
    button.classList.toggle("primary-action", isActive);
    button.classList.toggle("secondary-action", !isActive);
  });
}

function bindUndo() {
  els.undoButton.addEventListener("click", () => {
    const action = state.undoStack?.at(-1);
    if (!action) return;

    if (action.type === "sip") {
      state.sipLogs = state.sipLogs.filter((log) => log.id !== action.logId);
      state.undoStack = [];
      saveState();
      render();
      els.logHelper.textContent = `Undid ${action.label}.`;
      showToast("Drink log undone");
    }
  });
}

function bindBottleForm() {
  els.presetSelect.addEventListener("change", fillPreset);
  els.bottleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const brand = els.brandInput.value.trim() || "Other";
    const model = els.modelInput.value.trim() || "Bottle";
    const capacity = Number(els.capacityInput.value);
    const unit = els.unitSelect.value;

    if (!capacity || capacity < 1) {
      return;
    }

    const bottle = makeBottle(brand, model, capacity, unit, els.colorInput.value.trim());
    state.bottles.push(bottle);
    state.activeBottleId = bottle.id;
    saveState();
    els.bottleForm.reset();
    fillPreset();
    render();
    showToast(`${brand} ${model} added`);
  });

  els.seedButton.addEventListener("click", () => {
    if (!state.bottles.some((bottle) => bottle.brand === "Owala")) {
      state.bottles.push(makeBottle("Owala", "FreeSip", 32, "oz", "Coastal blue"));
    }
    if (!state.bottles.some((bottle) => bottle.brand === "YETI")) {
      state.bottles.push(makeBottle("YETI", "Rambler", 36, "oz", "Graphite"));
    }
    state.activeBottleId = state.activeBottleId || state.bottles[0]?.id || null;
    saveState();
    render();
    showToast("Example bottles loaded");
  });
}

function bindCleanButtons() {
  document.querySelectorAll("[data-clean-type]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCleanType = button.dataset.cleanType;
      state.settings.cleanType = selectedCleanType;
      saveState();
      renderCleanLevelButtons();
    });
  });

  els.saveCleanButton.addEventListener("click", saveCleanRecord);
}

function saveCleanRecord() {
  const bottle = getActiveBottle();
  if (!bottle) {
    els.cleanHelper.textContent = "Add a bottle before recording cleaning.";
    return;
  }

  const now = new Date().toISOString();
  const checkedParts = getCheckedCleanParts();
  const cleanedParts = checkedParts.length ? checkedParts : getChecklistParts(bottle);
  const cleanLog = {
    id: crypto.randomUUID(),
    bottleId: bottle.id,
    type: selectedCleanType,
    parts: cleanedParts,
    createdAt: now,
  };
  state.cleanLogs.push(cleanLog);
  state.undoStack = [
    {
      type: "clean",
      logId: cleanLog.id,
      bottleId: bottle.id,
      label: `${cleanLabel(selectedCleanType)} ${bottle.brand} ${bottle.model}`,
    },
  ];
  saveState();
  render();
  els.cleanHelper.textContent = `${cleanLabel(selectedCleanType)} saved: ${cleanedParts.join(", ")}.`;
  showToast(`${cleanLabel(selectedCleanType)} saved`);
}

function renderCleanLevelButtons() {
  document.querySelectorAll("[data-clean-type]").forEach((button) => {
    const isActive = button.dataset.cleanType === selectedCleanType;
    button.classList.toggle("selected-action", isActive);
    button.classList.toggle("primary-action", isActive);
    button.classList.toggle("secondary-action", !isActive);
  });
  els.cleanLevelDesc.textContent = getCleanLevelDescription(selectedCleanType);
}

function bindCleanUndo() {
  els.undoCleanButton.addEventListener("click", () => {
    const action = state.undoStack?.at(-1);
    if (!action || action.type !== "clean") return;

    const bottle = state.bottles.find((item) => item.id === action.bottleId);
    state.cleanLogs = state.cleanLogs.filter((log) => log.id !== action.logId);
    state.undoStack = [];
    saveState();
    render();
    els.cleanHelper.textContent = `Undid ${action.label}.`;
    showToast("Clean record undone");
  });
}

function bindUnitPreference() {
  els.unitButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.displayUnit = button.dataset.displayUnit;
      saveState();
      render();
    });
  });
}

function bindWeather() {
  els.weatherButton.addEventListener("click", refreshWeather);
  els.cityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    refreshWeatherByCity(els.cityInput.value.trim());
  });
}

function bindNotifications() {
  els.notifyButton.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      return;
    }
    const result = await Notification.requestPermission();
    els.notifyButton.textContent = result === "granted" ? "On" : "!";
  });
}

function renderPresetOptions() {
  els.presetSelect.innerHTML = "";
  presets.forEach((preset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${preset.brand} ${preset.model} ${preset.capacityOz} oz`;
    els.presetSelect.append(option);
  });
  const custom = document.createElement("option");
  custom.value = "custom";
  custom.textContent = "Custom bottle";
  els.presetSelect.append(custom);
  fillPreset();
}

function fillPreset() {
  const preset = presets[Number(els.presetSelect.value)] || presets[0];
  if (els.presetSelect.value === "custom") {
    els.brandInput.value = "";
    els.modelInput.value = "";
    els.capacityInput.value = "";
    els.unitSelect.value = "oz";
    return;
  }
  els.brandInput.value = preset.brand;
  els.modelInput.value = preset.model;
  els.capacityInput.value = preset.capacityOz;
  els.unitSelect.value = "oz";
}

function render() {
  renderToday();
  renderBottles();
  renderClean();
}

function renderToday() {
  const todayTotalMl = getTodayTotalMl();
  const todayOz = mlToOz(todayTotalMl);
  const goalOz = mlToOz(DAILY_GOAL_ML);
  const progress = Math.min(100, Math.round((todayTotalMl / DAILY_GOAL_ML) * 100));
  const activeBottle = getActiveBottle();
  const risk = activeBottle ? getBottleRisk(activeBottle) : null;
  const displayUnit = getDisplayUnit();

  if (displayUnit === "ml") {
    els.todayTotalOz.textContent = `${Math.round(todayTotalMl).toLocaleString()} ml`;
    els.todayGoalOz.textContent = `/ ${DAILY_GOAL_ML.toLocaleString()} ml`;
    els.todayTotalMl.textContent = `${Math.round(todayOz)} oz / ${Math.round(goalOz)} oz`;
  } else {
    els.todayTotalOz.textContent = `${Math.round(todayOz)} oz`;
    els.todayGoalOz.textContent = `/ ${Math.round(goalOz)} oz`;
    els.todayTotalMl.textContent = `${Math.round(todayTotalMl).toLocaleString()} ml / ${DAILY_GOAL_ML.toLocaleString()} ml`;
  }
  els.hydrationProgress.style.width = `${progress}%`;
  els.undoButton.disabled = state.undoStack?.at(-1)?.type !== "sip";
  renderUnitButtons();
  renderTodayPup(todayTotalMl, progress, activeBottle, risk);
  renderHydrationChart();

  if (!activeBottle) {
    els.activeBottleName.textContent = "No bottle yet";
    els.activeBottleMeta.textContent = "Add a bottle to start tracking by bottle.";
    setStatusPill(els.activeStatus, "clean", "Clean");
    return;
  }

  els.activeBottleName.textContent = `${activeBottle.brand} ${activeBottle.model}`;
  els.activeBottleMeta.textContent = `${Math.round(activeBottle.capacityOz)} oz · ${Math.round(activeBottle.capacityMl).toLocaleString()} ml · Last washed ${formatDateTime(getLastCleanAt(activeBottle.id, ["wash", "deep_clean"]))}`;
  setStatusPill(els.activeStatus, risk.statusClass, risk.statusLabel);
  renderWeather();
}

function renderTodayPup(todayTotalMl, progress, activeBottle, risk) {
  if (!activeBottle) {
    setPup(els.todayPup, els.todayPupMessage, "alert", "Add a bottle and I’ll help track it.");
    return;
  }

  if (risk?.statusClass === "now" || risk?.statusClass === "tonight") {
    setPup(els.todayPup, els.todayPupMessage, "wash", "This bottle needs clean care soon.");
    return;
  }

  if (progress >= 100) {
    setPup(els.todayPup, els.todayPupMessage, "happy", "Goal hit. Sip Pup approves.");
    return;
  }

  if (todayTotalMl > 0) {
    setPup(els.todayPup, els.todayPupMessage, "happy", "Nice sip. Keep the trail going.");
    return;
  }

  setPup(els.todayPup, els.todayPupMessage, "idle", "Log your first bottle when ready.");
}

function renderHydrationChart() {
  const logs = state.sipLogs
    .filter((log) => isToday(log.createdAt))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const width = 320;
  const height = 120;
  const padding = 18;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  if (!logs.length) {
    els.chartSummary.textContent = "No sips yet";
    els.hydrationChart.innerHTML = `
      <line class="chart-grid" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
      <text class="chart-label" x="${padding}" y="${height - 4}">6 AM</text>
      <text class="chart-label" x="${width - 58}" y="${height - 4}">Now</text>
    `;
    return;
  }

  const timelineItems = getTimelineItems(logs);
  let cumulative = 0;
  const now = new Date();
  const maxMl = Math.max(DAILY_GOAL_ML, getTodayTotalMl());
  const points = timelineItems.map((item) => {
    cumulative += item.amountMl;
    const minutes = item.minuteOfDay;
    const x = padding + (minutes / 1439) * usableWidth;
    const y = height - padding - (cumulative / maxMl) * usableHeight;
    return { x, y, cumulative, amountMl: item.amountMl, label: item.label, timeLabel: item.timeLabel, count: item.count };
  });
  const nowX = padding + ((now.getHours() * 60 + now.getMinutes()) / 1439) * usableWidth;
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const dots = points
    .map((point) => `<circle class="chart-dot" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4"><title>${point.timeLabel}: ${formatAmountLabel(point.amountMl)}${point.count > 1 ? ` across ${point.count} logs` : ""}</title></circle>`)
    .join("");
  const labels = points
    .map((point, index) => {
      const x = Math.max(24, Math.min(width - 48, point.x - 18));
      const y = Math.max(12, point.y - (index % 2 === 0 ? 10 : 24));
      return `<text class="chart-value-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${formatAmountLabel(point.amountMl)}</text>`;
    })
    .join("");

  els.chartSummary.textContent =
    timelineItems.length === logs.length
      ? `${logs.length} log${logs.length === 1 ? "" : "s"} today`
      : `${logs.length} logs grouped into ${timelineItems.length} blocks`;
  els.hydrationChart.innerHTML = `
    <line class="chart-grid" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
    <line class="chart-grid" x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" />
    <line class="chart-grid" x1="${nowX.toFixed(1)}" y1="${padding}" x2="${nowX.toFixed(1)}" y2="${height - padding}" />
    <path class="chart-line" d="${path}" />
    ${dots}
    ${labels}
    <text class="chart-label" x="${padding}" y="${height - 4}">12 AM</text>
    <text class="chart-label" x="${width - 50}" y="${height - 4}">11 PM</text>
  `;
}

function getTimelineItems(logs) {
  if (logs.length <= 8) {
    return logs.map((log) => {
      const date = new Date(log.createdAt);
      return {
        amountMl: log.amountMl,
        minuteOfDay: date.getHours() * 60 + date.getMinutes(),
        count: 1,
        timeLabel: formatClock(date),
      };
    });
  }

  const bucketSizeMinutes = 120;
  const buckets = new Map();
  logs.forEach((log) => {
    const date = new Date(log.createdAt);
    const minuteOfDay = date.getHours() * 60 + date.getMinutes();
    const bucketStart = Math.floor(minuteOfDay / bucketSizeMinutes) * bucketSizeMinutes;
    const bucket = buckets.get(bucketStart) || { amountMl: 0, count: 0, minuteOfDay: bucketStart + bucketSizeMinutes / 2 };
    bucket.amountMl += log.amountMl;
    bucket.count += 1;
    buckets.set(bucketStart, bucket);
  });

  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bucketStart, bucket]) => ({
      ...bucket,
      timeLabel: `${formatMinuteOfDay(bucketStart)}-${formatMinuteOfDay(Math.min(1439, bucketStart + bucketSizeMinutes))}`,
    }));
}

function renderBottles() {
  els.bottleList.innerHTML = "";
  if (!state.bottles.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Add your first Owala, YETI, or custom bottle.";
    els.bottleList.append(empty);
    return;
  }

  state.bottles.forEach((bottle) => {
    const risk = getBottleRisk(bottle);
    const recent = getRecentDrinkLabel(bottle.id);
    const lastWashedAt = getLastCleanAt(bottle.id, ["wash", "deep_clean"]);
    const lastDeepCleanedAt = getLastCleanAt(bottle.id, ["deep_clean"]);
    const card = document.createElement("article");
    card.className = `bottle-card${bottle.id === state.activeBottleId ? " active-bottle" : ""}`;
    card.innerHTML = `
      <div class="bottle-card-header">
        <div>
          <p class="bottle-title">${escapeHtml(bottle.brand)} ${escapeHtml(bottle.model)}</p>
          <p class="bottle-meta">
            <span>${Math.round(bottle.capacityOz)} oz · ${Math.round(bottle.capacityMl).toLocaleString()} ml${bottle.color ? ` · ${escapeHtml(bottle.color)}` : ""}</span>
            <span>Last washed: ${formatDateTime(lastWashedAt)}</span>
            <span>Last deep clean: ${formatDateTime(lastDeepCleanedAt)}</span>
            <span>Recent: ${recent}</span>
          </p>
        </div>
        <span class="status-pill ${risk.statusClass}">${risk.statusLabel}</span>
      </div>
      <div class="card-actions">
        <button class="secondary-action" type="button" data-action="active" data-id="${bottle.id}">Set active</button>
        <button class="secondary-action danger-action" type="button" data-action="remove" data-id="${bottle.id}">Remove</button>
      </div>
    `;
    els.bottleList.append(card);
  });

  els.bottleList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const bottle = state.bottles.find((item) => item.id === button.dataset.id);
      if (!bottle) return;
      if (button.dataset.action === "active") {
        state.activeBottleId = bottle.id;
        showToast(`${bottle.brand} ${bottle.model} is active`);
      }
      if (button.dataset.action === "remove") {
        if (!window.confirm(`Remove ${bottle.brand} ${bottle.model}? This also deletes its sip and clean history.`)) {
          return;
        }
        const label = `${bottle.brand} ${bottle.model}`;
        removeBottle(bottle.id);
        showToast(`${label} removed`);
      }
      saveState();
      render();
    });
  });
}

function removeBottle(bottleId) {
  state.bottles = state.bottles.filter((bottle) => bottle.id !== bottleId);
  state.sipLogs = state.sipLogs.filter((log) => log.bottleId !== bottleId);
  state.cleanLogs = state.cleanLogs.filter((log) => log.bottleId !== bottleId);
  state.undoStack = [];

  if (state.activeBottleId === bottleId) {
    state.activeBottleId = state.bottles[0]?.id || null;
  }
}

function renderClean() {
  const bottle = getActiveBottle();
  els.undoCleanButton.disabled = state.undoStack?.at(-1)?.type !== "clean";
  renderCleanLevelButtons();
  if (!bottle) {
    els.cleanBottleName.textContent = "No bottle selected";
    els.cleanReason.textContent = "Add a bottle to get a cleaning checklist.";
    setStatusPill(els.cleanStatus, "clean", "Clean");
    setPup(els.cleanPup, els.cleanPupMessage, "alert", "Add a bottle and I’ll watch the lid.");
    els.cleanChecklist.innerHTML = "";
    els.bottleVisual.innerHTML = "";
    els.activePartLabel.textContent = "No bottle";
    els.cleanHistory.innerHTML = "";
    return;
  }

  const risk = getBottleRisk(bottle);
  els.cleanBottleName.textContent = `${bottle.brand} ${bottle.model} ${Math.round(bottle.capacityOz)} oz`;
  els.cleanReason.textContent = risk.reason;
  setStatusPill(els.cleanStatus, risk.statusClass, risk.statusLabel);
  renderCleanPup(risk);

  const parts = getChecklistParts(bottle);
  renderBottleVisual(parts);
  els.cleanChecklist.innerHTML = "";
  parts.forEach((item) => {
    const label = document.createElement("label");
    label.className = "check-item";
    label.dataset.part = item;
    label.innerHTML = `<input type="checkbox" value="${escapeHtml(item)}" /> <span>${item}</span>`;
    label.addEventListener("mouseenter", () => activateVisualPart(item));
    label.addEventListener("focusin", () => activateVisualPart(item));
    label.addEventListener("click", () => activateVisualPart(item));
    els.cleanChecklist.append(label);
  });
  activateVisualPart(parts[0]);
  renderCleanHistory(bottle);
}

function renderCleanPup(risk) {
  if (risk.statusClass === "now") {
    setPup(els.cleanPup, els.cleanPupMessage, "wash", `${risk.action || "Wash"} now. Don’t let residue sit.`);
    return;
  }
  if (risk.statusClass === "tonight" || risk.statusClass === "soon") {
    setPup(els.cleanPup, els.cleanPupMessage, "alert", `${risk.action || "Wash"} by ${formatDeadline(risk.deadline)}.`);
    return;
  }
  setPup(els.cleanPup, els.cleanPupMessage, "idle", "Bottle looks good. Let parts dry open.");
}

function renderWeather() {
  if (!state.weather) {
    els.weatherTitle.textContent = "Weather not loaded";
    els.weatherCopy.textContent = "Use location or enter a city to tune wash timing.";
    return;
  }
  const source = state.weather.city ? ` · ${state.weather.city}` : "";
  els.weatherTitle.textContent = `${Math.round(state.weather.temperatureF)}°F · ${Math.round(state.weather.humidity)}% humidity${source}`;
  els.weatherCopy.textContent = "Heat or humidity shortens rinse and wash windows.";
}

function renderBottleVisual(parts) {
  els.bottleVisual.innerHTML = parts
    .map((part) => {
      const className = getVisualClass(part);
      return `<div class="visual-part ${className}" data-part="${escapeHtml(part)}"></div>`;
    })
    .join("");
}

function getVisualClass(part) {
  const normalized = part.toLowerCase();
  if (normalized.includes("body")) return "visual-body";
  if (normalized.includes("lid") || normalized.includes("cap")) return "visual-cap";
  if (normalized.includes("straw")) return "visual-straw";
  if (normalized.includes("spout") || normalized.includes("gasket") || normalized.includes("thread")) return "visual-spout";
  if (normalized.includes("button") || normalized.includes("magslider")) return "visual-button";
  return "visual-body";
}

function activateVisualPart(part) {
  els.activePartLabel.textContent = part;
  els.cleanChecklist.querySelectorAll(".check-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.part === part);
  });
  els.bottleVisual.querySelectorAll(".visual-part").forEach((item) => {
    item.classList.toggle("active", item.dataset.part === part);
  });
}

function renderCleanHistory(bottle) {
  const logs = state.cleanLogs
    .filter((log) => log.bottleId === bottle.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  els.cleanHistory.innerHTML = "";
  if (!logs.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No clean records yet.";
    els.cleanHistory.append(empty);
    return;
  }

  logs.forEach((log) => {
    const item = document.createElement("article");
    item.className = "history-item";
    const parts = log.parts?.length ? log.parts.join(", ") : "Parts not specified";
    item.innerHTML = `
      <p class="history-title">${cleanLabel(log.type)} · ${formatDateTime(log.createdAt)}</p>
      <p class="history-meta">Parts: ${escapeHtml(parts)}</p>
    `;
    els.cleanHistory.append(item);
  });
}

async function refreshWeather() {
  els.weatherTitle.textContent = "Checking location...";
  if (!navigator.geolocation) {
    els.weatherTitle.textContent = "Location unavailable";
    els.weatherCopy.textContent = "Enter a city instead.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        await setWeatherFromCoordinates(latitude, longitude, "");
      } catch {
        els.weatherTitle.textContent = "Weather failed";
        els.weatherCopy.textContent = "Enter a city or try again when the network is available.";
      }
    },
    () => {
      els.weatherTitle.textContent = "Location blocked";
      els.weatherCopy.textContent = "Enter a city to use weather-based wash reminders.";
    },
  );
}

async function refreshWeatherByCity(city) {
  if (!city) {
    els.weatherTitle.textContent = "City needed";
    els.weatherCopy.textContent = "Enter a city name, like Austin or Toronto.";
    return;
  }

  els.weatherTitle.textContent = `Finding ${city}...`;
  try {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();
    const match = geoData.results?.[0];
    if (!match) {
      els.weatherTitle.textContent = "City not found";
      els.weatherCopy.textContent = "Try a larger nearby city.";
      return;
    }

    const label = [match.name, match.admin1, match.country_code].filter(Boolean).join(", ");
    await setWeatherFromCoordinates(match.latitude, match.longitude, label);
  } catch {
    els.weatherTitle.textContent = "Weather failed";
    els.weatherCopy.textContent = "Check the city spelling or try again later.";
  }
}

async function setWeatherFromCoordinates(latitude, longitude, city) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m");
  url.searchParams.set("temperature_unit", "fahrenheit");
  const response = await fetch(url);
  const data = await response.json();
  state.weather = {
    temperatureF: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    city,
    updatedAt: new Date().toISOString(),
  };
  saveState();
  render();
  maybeNotifyRisk();
}

function maybeNotifyRisk() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  state.bottles.forEach((bottle) => {
    const risk = getBottleRisk(bottle);
    if (!["tonight", "now"].includes(risk.statusClass)) {
      return;
    }
    const notificationKey = `${bottle.id}:${risk.statusClass}:${todayKey()}`;
    if (state.notifiedKeys.includes(notificationKey)) {
      return;
    }
    state.notifiedKeys.push(notificationKey);
    saveState();
    new Notification(`SipFit: ${risk.statusLabel}`, {
      body: `${bottle.brand} ${bottle.model} needs attention. ${risk.reason}`,
      tag: notificationKey,
    });
  });
}

function getBottleRisk(bottle) {
  const unwashedSips = getUnwashedSips(bottle);

  if (!unwashedSips.length) {
    return {
      score: 0,
      statusLabel: "Clean",
      statusClass: "clean",
      reason: `Clean: no logged drinks since ${formatDateTime(getLastCleanAt(bottle.id, ["wash", "deep_clean"]))}.`,
      action: null,
      deadline: null,
    };
  }

  const dueItems = unwashedSips.map((log) => {
    const drink = drinkTypes.find((item) => item.id === log.drinkType) || drinkTypes.at(-1);
    const dueHours = getDueHours(drink);
    return {
      log,
      drink,
      dueHours,
      deadline: new Date(new Date(log.createdAt).getTime() + dueHours * 36e5),
    };
  });
  dueItems.sort((a, b) => a.deadline - b.deadline);

  const nextDue = dueItems[0];
  const remainingHours = (nextDue.deadline.getTime() - Date.now()) / 36e5;
  const status = getDeadlineStatus(nextDue.drink.action, nextDue.deadline, remainingHours);
  const weatherText = getWeatherAdjustmentText();
  const reasonParts = [`${nextDue.drink.label}`, `${nextDue.drink.action} by ${formatDeadline(nextDue.deadline)}`];
  if (weatherText) reasonParts.push(weatherText);

  return {
    score: Math.max(0, Math.round((24 - remainingHours) / 2)),
    statusLabel: status.label,
    statusClass: status.className,
    reason: reasonParts.join(". ") + ".",
    action: nextDue.drink.action,
    deadline: nextDue.deadline.toISOString(),
  };
}

function getWeatherRisk() {
  if (!state.weather) return 0;
  let risk = 0;
  if (state.weather.temperatureF > 90) risk += 3;
  else if (state.weather.temperatureF > 80) risk += 2;
  if (state.weather.humidity > 65) risk += 2;
  return risk;
}

function getDueHours(drink) {
  if (drink.id === "protein" && state.weather?.temperatureF > 90) {
    return drink.hotDueHours || 1;
  }

  const warmOrHumid = state.weather && (state.weather.temperatureF > 80 || state.weather.humidity > 65);
  if (!warmOrHumid) {
    return drink.dueHours;
  }

  const adjusted = drink.dueHours * 0.75;
  if (drink.id === "water") return Math.max(18, adjusted);
  if (drink.id === "protein") return Math.max(1.5, adjusted);
  return Math.max(4, adjusted);
}

function getDeadlineStatus(action, deadline, remainingHours) {
  if (remainingHours <= 0) {
    return { label: `${action} now`, className: "now" };
  }
  if (remainingHours <= 2) {
    return { label: `${action} by ${formatClock(deadline)}`, className: "tonight" };
  }
  if (remainingHours <= 8) {
    return { label: `${action} by ${formatClock(deadline)}`, className: "soon" };
  }
  return { label: `Clean until ${formatDeadline(deadline)}`, className: "clean" };
}

function getUnwashedSips(bottle) {
  const lastWashedAt = getLastCleanAt(bottle.id, ["wash", "deep_clean"]);
  const lastWashTime = lastWashedAt ? new Date(lastWashedAt).getTime() : 0;
  return state.sipLogs.filter((log) => log.bottleId === bottle.id && new Date(log.createdAt).getTime() > lastWashTime);
}

function getWeatherAdjustmentText() {
  if (!state.weather) return "";
  if (state.weather.temperatureF > 90) {
    return "Hot weather: faster clean";
  }
  if (state.weather.temperatureF > 80 && state.weather.humidity > 65) {
    return "Warm + humid: faster clean";
  }
  if (state.weather.temperatureF > 80) {
    return "Warm weather: faster clean";
  }
  if (state.weather.humidity > 65) {
    return "High humidity: faster clean";
  }
  return "";
}

function getActiveBottle() {
  return state.bottles.find((bottle) => bottle.id === state.activeBottleId) || state.bottles[0] || null;
}

function getTodayTotalMl() {
  return state.sipLogs
    .filter((log) => isToday(log.createdAt))
    .reduce((total, log) => total + log.amountMl, 0);
}

function getRecentDrink(bottleId) {
  return [...state.sipLogs].reverse().find((log) => log.bottleId === bottleId) || null;
}

function getRecentDrinkLabel(bottleId) {
  const recent = getRecentDrink(bottleId);
  if (!recent) return "None";
  return drinkTypes.find((drink) => drink.id === recent.drinkType)?.label || "Other";
}

function getLastCleanAt(bottleId, types) {
  const log = [...state.cleanLogs]
    .filter((item) => item.bottleId === bottleId && types.includes(item.type))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const bottle = state.bottles.find((item) => item.id === bottleId);
  if (log) return log.createdAt;
  if (types.includes("deep_clean") && bottle?.lastDeepCleanedAt) return bottle.lastDeepCleanedAt;
  if (types.some((type) => ["wash", "deep_clean"].includes(type)) && bottle?.lastWashedAt) return bottle.lastWashedAt;
  return null;
}

function getChecklistParts(bottle) {
  const brandKey = bottle.brand.toLowerCase().includes("owala")
    ? "owala"
    : bottle.brand.toLowerCase().includes("yeti")
      ? "yeti"
      : "other";
  return checklistByBrand[brandKey];
}

function getCheckedCleanParts() {
  return [...els.cleanChecklist.querySelectorAll("input:checked")].map((input) => input.value);
}

function makeBottle(brand, model, capacity, unit, color = "") {
  const capacityMl = unit === "oz" ? Math.round(capacity * OZ_TO_ML) : Math.round(capacity);
  return {
    id: crypto.randomUUID(),
    brand,
    model,
    capacityOz: capacityMl / OZ_TO_ML,
    capacityMl,
    color,
    createdAt: new Date().toISOString(),
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      bottles: [],
      sipLogs: [],
      cleanLogs: [],
      weather: null,
      activeBottleId: null,
      notifiedKeys: [],
      undoStack: [],
      settings: { displayUnit: "oz", cleanType: "wash" },
      hasSeeded: false,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      bottles: parsed.bottles || [],
      sipLogs: parsed.sipLogs || [],
      cleanLogs: parsed.cleanLogs || [],
      weather: parsed.weather || null,
      activeBottleId: parsed.activeBottleId || null,
      notifiedKeys: parsed.notifiedKeys || [],
      undoStack: parsed.undoStack || [],
      settings: { displayUnit: parsed.settings?.displayUnit || "oz", cleanType: parsed.settings?.cleanType || "wash" },
      hasSeeded: Boolean(parsed.hasSeeded),
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return {
      bottles: [],
      sipLogs: [],
      cleanLogs: [],
      weather: null,
      activeBottleId: null,
      notifiedKeys: [],
      undoStack: [],
      settings: { displayUnit: "oz", cleanType: "wash" },
      hasSeeded: false,
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setStatusPill(element, className, label) {
  element.className = `status-pill ${className}`;
  element.textContent = label;
}

function mlToOz(ml) {
  return ml / OZ_TO_ML;
}

function getDisplayUnit() {
  return state.settings?.displayUnit === "ml" ? "ml" : "oz";
}

function hoursSince(isoDate) {
  if (!isoDate) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(isoDate).getTime()) / 36e5;
}

function relativeTime(isoDate) {
  if (!isoDate) return "never";
  const hours = hoursSince(isoDate);
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDateTime(isoDate) {
  if (!isoDate) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function formatClock(date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMinuteOfDay(minutes) {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return formatClock(date);
}

function formatDeadline(date) {
  const deadline = new Date(date);
  if (isToday(deadline.toISOString())) return formatClock(deadline);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(deadline);
}

function formatHours(hours) {
  if (hours === 1) return "1 hour";
  if (Number.isInteger(hours)) return `${hours} hours`;
  return `${Math.round(hours * 10) / 10} hours`;
}

function formatAmountLabel(amountMl) {
  if (getDisplayUnit() === "ml") {
    return `${Math.round(amountMl).toLocaleString()} ml`;
  }
  const oz = Math.round(mlToOz(amountMl));
  return `${oz} oz`;
}

function drinkLabel(drinkType) {
  return drinkTypes.find((drink) => drink.id === drinkType)?.label || "drink";
}


function isToday(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatFraction(fraction) {
  if (fraction === 1) return "1 bottle";
  if (fraction === 0.5) return "1/2 bottle";
  return "1/4 bottle";
}

function cleanLabel(type) {
  if (type === "deep_clean") return "Deep clean";
  if (type === "wash") return "Wash";
  return "Rinse";
}

function getCleanLevelDescription(type) {
  if (type === "rinse") return "Rinsed: quick water flush for fresh residue or temporary protein cleanup.";
  if (type === "deep_clean") return "Deep cleaned: disassembled lid, straw, gasket, and hard-to-reach parts.";
  return "Washed: soap clean for daily bottle care.";
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2200);
}

function setPup(card, messageElement, stateName, message) {
  card.dataset.pupState = stateName;
  messageElement.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
