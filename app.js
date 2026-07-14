const zones = [
  { id: "gateA", label: "Gate A", type: "entry", x: 18, y: 24, level: "medium", crowd: 64 },
  { id: "gateB", label: "Gate B", type: "entry", x: 34, y: 18, level: "high", crowd: 86 },
  { id: "gateC", label: "Gate C", type: "entry", x: 50, y: 20, level: "medium", crowd: 71 },
  { id: "gateD", label: "Gate D", type: "entry", x: 66, y: 24, level: "low", crowd: 38 },
  { id: "concourse", label: "Main Concourse", type: "hub", x: 50, y: 52, level: "high", crowd: 88 },
  { id: "family", label: "Family Zone", type: "amenity", x: 28, y: 63, level: "low", crowd: 34 },
  { id: "food", label: "Food Court", type: "amenity", x: 48, y: 72, level: "high", crowd: 90 },
  { id: "restroom", label: "Restrooms", type: "amenity", x: 70, y: 62, level: "medium", crowd: 63 },
  { id: "vip", label: "VIP Lounge", type: "amenity", x: 73, y: 36, level: "low", crowd: 29 },
  { id: "parkingA", label: "Lot A", type: "parking", x: 14, y: 80, level: "medium", crowd: 58 },
  { id: "parkingB", label: "Lot B", type: "parking", x: 36, y: 86, level: "high", crowd: 81 },
  { id: "parkingC", label: "Lot C", type: "parking", x: 58, y: 84, level: "low", crowd: 27 },
  { id: "parkingD", label: "Lot D", type: "parking", x: 81, y: 78, level: "low", crowd: 22 },
  { id: "exitNorth", label: "North Exit", type: "exit", x: 26, y: 10, level: "medium", crowd: 52 },
  { id: "exitSouth", label: "South Exit", type: "exit", x: 60, y: 92, level: "low", crowd: 18 },
];

const graph = {
  gateA: { concourse: 4, family: 3, exitNorth: 5, parkingA: 6 },
  gateB: { concourse: 2, vip: 4, exitNorth: 4, gateC: 3 },
  gateC: { concourse: 3, restroom: 3, vip: 4, gateD: 4 },
  gateD: { concourse: 2, parkingD: 5, exitNorth: 5, vip: 3 },
  concourse: { family: 3, food: 2, restroom: 2, vip: 3, exitSouth: 4 },
  family: { food: 3, parkingA: 4, exitSouth: 5 },
  food: { restroom: 2, exitSouth: 3, parkingB: 4, parkingC: 4 },
  restroom: { vip: 3, parkingD: 4, exitSouth: 4 },
  vip: { exitNorth: 3, exitSouth: 4 },
  parkingA: { gateA: 6, family: 4 },
  parkingB: { food: 4, concourse: 4 },
  parkingC: { food: 4, exitSouth: 4 },
  parkingD: { gateD: 5, restroom: 4 },
  exitNorth: {},
  exitSouth: {},
};

const parkingLots = [
  { id: "parkingA", label: "Lot A", spots: 182, ev: 18, accessible: 14, walk: 8, gate: "Gate A" },
  { id: "parkingB", label: "Lot B", spots: 64, ev: 8, accessible: 6, walk: 11, gate: "Main Concourse" },
  { id: "parkingC", label: "Lot C", spots: 241, ev: 28, accessible: 16, walk: 7, gate: "Gate D" },
  { id: "parkingD", label: "Lot D", spots: 268, ev: 22, accessible: 20, walk: 6, gate: "North Exit" },
];

const queueLines = [
  { label: "Security screening", base: 14, delta: 2, location: "Gate B & Gate C" },
  { label: "Merch stand", base: 11, delta: 1, location: "Main Concourse" },
  { label: "Food kiosks", base: 16, delta: 3, location: "Lower bowl" },
  { label: "Restrooms", base: 9, delta: 1, location: "Club level" },
];

const alerts = [
  {
    severity: "info",
    title: "Weather advisory",
    text: "A short rain band is expected in 22 minutes. Covered routes are being prioritized.",
  },
  {
    severity: "warn",
    title: "Crowd surge watch",
    text: "Gate B and the central concourse are trending upward. Extra stewards deployed.",
  },
];

const personas = [
  {
    name: "Family arrival",
    tags: ["Stroller-friendly route", "Closest family restroom", "Low-congestion entry"],
    note: "Use Gate A with Lot A. You'll avoid the busiest security lane and stay near the family zone.",
  },
  {
    name: "VIP guest",
    tags: ["Priority parking", "Lounge access", "Fast-track entry"],
    note: "Lot D gives the shortest path to the VIP lounge and avoids the main concourse pinch point.",
  },
  {
    name: "Accessible guest",
    tags: ["Step-free route", "Accessible parking", "Low-crowd navigation"],
    note: "Lot C has the best accessibility score today and routes directly to Gate D via ramps.",
  },
  {
    name: "Away supporter",
    tags: ["Late-arrival guidance", "Direct gate path", "Exit planning"],
    note: "Gate D is the best entry if you are arriving close to kickoff. Use the north exit after the match.",
  },
];

const state = {
  emergencyMode: false,
  preference: "fastest",
  personaIndex: 0,
  selectedOrigin: "gateA",
  selectedDestination: "exitSouth",
  pressure: 0,
  tick: 0,
};

const elements = {
  stadiumMap: document.getElementById("stadiumMap"),
  densityGrid: document.getElementById("densityGrid"),
  queueList: document.getElementById("queueList"),
  alertsList: document.getElementById("alertsList"),
  notificationFeed: document.getElementById("notificationFeed"),
  parkingReco: document.getElementById("parkingReco"),
  prefsSummary: document.getElementById("prefsSummary"),
  routeSteps: document.getElementById("routeSteps"),
  originSelect: document.getElementById("originSelect"),
  destinationSelect: document.getElementById("destinationSelect"),
  preferenceSelect: document.getElementById("preferenceSelect"),
  refreshBtn: document.getElementById("refreshBtn"),
  emergencyBtn: document.getElementById("emergencyBtn"),
  togglePrefsBtn: document.getElementById("togglePrefsBtn"),
  occupancyValue: document.getElementById("occupancyValue"),
  routeDelayValue: document.getElementById("routeDelayValue"),
  parkingConfidence: document.getElementById("parkingConfidence"),
  matchPulse: document.getElementById("matchPulse"),
  aiInsight: document.getElementById("aiInsight"),
  crowdState: document.getElementById("crowdState"),
  parkingBadge: document.getElementById("parkingBadge"),
  routeMode: document.getElementById("routeMode"),
  routeTime: document.getElementById("routeTime"),
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function levelToColor(level) {
  if (level >= 80) return "var(--danger)";
  if (level >= 55) return "var(--warning)";
  return "var(--good)";
}

function getZone(id) {
  return zones.find((zone) => zone.id === id);
}

function allZoneOptions() {
  return zones
    .filter((zone) => !zone.type.includes("parking"))
    .map((zone) => `<option value="${zone.id}">${zone.label}</option>`)
    .join("");
}

function renderMap() {
  elements.stadiumMap.innerHTML = "";

  const stage = document.createElement("div");
  stage.className = "route-node";
  stage.style.left = "50%";
  stage.style.top = "50%";
  elements.stadiumMap.appendChild(stage);

  zones.forEach((zone) => {
    const el = document.createElement("div");
    el.className = "zone";
    el.dataset.level = zone.level;
    el.style.left = `${zone.x}%`;
    el.style.top = `${zone.y}%`;
    el.innerHTML = `<strong>${zone.label}</strong><span>${zone.type.toUpperCase()}</span>`;
    elements.stadiumMap.appendChild(el);
  });
}

function renderZoneDensity() {
  const zonesToRender = zones.filter((zone) => ["entry", "hub", "amenity", "exit"].includes(zone.type));
  elements.densityGrid.innerHTML = zonesToRender
    .map((zone) => {
      const barColor = levelToColor(zone.crowd);
      return `
        <div class="density-item">
          <div class="metric-row">
            <strong>${zone.label}</strong>
            <span>${zone.crowd}%</span>
          </div>
          <p>${zone.level === "high" ? "Dense but moving." : zone.level === "medium" ? "Moderate flow." : "Easy access."}</p>
          <div class="crowd-meter"><span style="width:${zone.crowd}%; background:${barColor}"></span></div>
        </div>
      `;
    })
    .join("");
}

function renderQueues() {
  elements.queueList.innerHTML = queueLines
    .map((queue) => {
      const wait = queue.base + Math.round((Math.sin(state.tick / 3 + queue.delta) + 1) * 2);
      const color = wait > 15 ? "var(--danger)" : wait > 10 ? "var(--warning)" : "var(--good)";
      return `
        <div class="queue-item">
          <div class="metric-row">
            <strong>${queue.label}</strong>
            <span style="color:${color}">${wait} min</span>
          </div>
          <p>${queue.location}</p>
        </div>
      `;
    })
    .join("");
}

function renderAlerts() {
  const emergency = state.emergencyMode
    ? [
        {
          severity: "critical",
          title: "Emergency mode active",
          text: "Guests should move to the nearest safe exit. Routes have been rerouted to reduce congestion and preserve evacuation lanes.",
        },
      ]
    : [];

  elements.alertsList.innerHTML = [...emergency, ...alerts]
    .map((alert) => {
      const color =
        alert.severity === "critical" ? "var(--danger)" : alert.severity === "warn" ? "var(--warning)" : "var(--accent-2)";
      return `
        <div class="alert-item" style="border-color:${color}33">
          <div class="metric-row">
            <strong style="color:${color}">${alert.title}</strong>
            <span>${alert.severity.toUpperCase()}</span>
          </div>
          <p>${alert.text}</p>
        </div>
      `;
    })
    .join("");
}

function routePreferenceWeights(preference) {
  return (
    {
      fastest: { crowd: 1.0, comfort: 0, family: 0, accessible: 0 },
      leastCrowded: { crowd: 1.45, comfort: 0, family: 0, accessible: 0 },
      accessible: { crowd: 1.15, comfort: 0.35, family: 0, accessible: 1 },
      family: { crowd: 1.05, comfort: 0.6, family: 1, accessible: 0 },
    }[preference] || { crowd: 1.0, comfort: 0, family: 0, accessible: 0 }
  );
}

function shortestPath(start, end, preference = "fastest") {
  const distances = Object.fromEntries(Object.keys(graph).map((node) => [node, Infinity]));
  const previous = {};
  const visited = new Set();
  const weights = routePreferenceWeights(preference);

  distances[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let current = null;
    let currentDistance = Infinity;

    for (const node of Object.keys(distances)) {
      if (!visited.has(node) && distances[node] < currentDistance) {
        current = node;
        currentDistance = distances[node];
      }
    }

    if (current === null) break;
    if (current === end) break;
    visited.add(current);

    for (const [neighbor, weight] of Object.entries(graph[current])) {
      const neighborZone = getZone(neighbor);
      const comfortBias =
        weights.family && (neighborZone.type === "amenity" || neighborZone.id === "family" || neighborZone.id === "food" || neighborZone.id === "restroom")
          ? -0.75
          : 0;
      const accessibilityBias = weights.accessible && (neighborZone.type === "exit" || neighborZone.type === "parking") ? -0.3 : 0;
      const adjustedWeight =
        weight +
        (neighborZone.crowd / 26) * weights.crowd +
        comfortBias +
        accessibilityBias +
        (state.emergencyMode ? 0.5 : 0);
      const nextDistance = distances[current] + adjustedWeight;
      if (nextDistance < distances[neighbor]) {
        distances[neighbor] = nextDistance;
        previous[neighbor] = current;
      }
    }
  }

  const path = [];
  let cursor = end;
  if (!previous[cursor] && cursor !== start) {
    path.push(start, end);
    return { path, distance: Math.round(distances[end] || 0) };
  }

  while (cursor) {
    path.unshift(cursor);
    cursor = previous[cursor];
  }

  return { path, distance: Math.round(distances[end] || 0) };
}

function routePreferenceLabel() {
  if (state.emergencyMode) return "Emergency evacuation route";
  const preference = elements.preferenceSelect.value;
  return {
    fastest: "Fastest route",
    leastCrowded: "Least crowded route",
    accessible: "Accessible route",
    family: "Family-friendly route",
  }[preference];
}

function routeDestination() {
  return state.emergencyMode ? "exitSouth" : state.selectedDestination;
}

function renderRoute() {
  const destination = routeDestination();
  const result = shortestPath(state.selectedOrigin, destination, elements.preferenceSelect.value);
  const pathZones = result.path.map(getZone).filter(Boolean);

  elements.routeMode.textContent = routePreferenceLabel();
  elements.routeTime.textContent = `${Math.max(3, result.distance + (state.emergencyMode ? 2 : 0))} min`;
  elements.routeDelayValue.textContent = `${Math.max(2, Math.round(result.distance / 2) + (state.emergencyMode ? 3 : 1))} min`;

  elements.routeSteps.innerHTML = pathZones
    .map((zone, index) => {
      const nextZone = pathZones[index + 1];
      if (!nextZone) return `<li>Arrive at ${zone.label}. Monitor live steward updates for last-meter guidance.</li>`;
      const leg = Math.max(1, Math.round((Math.abs(zone.x - nextZone.x) + Math.abs(zone.y - nextZone.y)) / 9));
      return `<li>From ${zone.label}, follow the illuminated corridor to ${nextZone.label} (${leg} min).</li>`;
    })
    .join("");

  elements.stadiumMap.querySelectorAll(".route-line,.route-node").forEach((node) => node.remove());

  pathZones.forEach((zone, index) => {
    const marker = document.createElement("div");
    marker.className = `route-node ${index === pathZones.length - 1 ? "end" : ""}`;
    marker.style.left = `${zone.x}%`;
    marker.style.top = `${zone.y}%`;
    elements.stadiumMap.appendChild(marker);

    const next = pathZones[index + 1];
    if (!next) return;

    const line = document.createElement("div");
    line.className = "route-line";
    const dx = next.x - zone.x;
    const dy = next.y - zone.y;
    const length = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    line.style.left = `${zone.x}%`;
    line.style.top = `${zone.y}%`;
    line.style.width = `${length}%`;
    line.style.transform = `rotate(${angle}deg)`;
    elements.stadiumMap.appendChild(line);
  });
}

function recommendParking() {
  const preference = elements.preferenceSelect.value;
  const selectedDestination = getZone(state.selectedDestination);

  const scored = parkingLots.map((lot) => {
    const lotZone = getZone(lot.id);
    const crowdPenalty = lotZone.crowd / 10;
    const accessibilityBoost = preference === "accessible" ? lot.accessible * 2 : 0;
    const familyBoost = preference === "family" ? (lot.label === "Lot A" || lot.label === "Lot C" ? 12 : 0) : 0;
    const vipBoost = preference === "fastest" && lot.label === "Lot D" ? 10 : 0;
    const routeDistance = shortestPath(lot.id, state.selectedOrigin, preference).distance;
    const exitBias = selectedDestination?.type === "exit" ? Math.abs(selectedDestination.x - lotZone.x) / 10 : 0;

    return {
      ...lot,
      score:
        lot.spots / 50 +
        accessibilityBoost +
        familyBoost +
        vipBoost -
        crowdPenalty -
        routeDistance -
        exitBias,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  elements.parkingReco.innerHTML = `
    <div class="parking-item">
      <div class="metric-row">
        <strong>${best.label}</strong>
        <span>${best.walk} min walk</span>
      </div>
      <p>${best.spots} open spots, ${best.ev} EV stalls, ${best.accessible} accessible bays. Best access: ${best.gate}.</p>
    </div>
    <div class="parking-item">
      <div class="metric-row">
        <strong>Backup lot</strong>
        <span>${scored[1].walk} min walk</span>
      </div>
      <p>${scored[1].label} remains a strong fallback if the lead lot fills during peak arrivals.</p>
    </div>
  `;

  elements.parkingConfidence.textContent = `${clamp(Math.round(best.score * 7 + 52), 68, 99)}%`;
  elements.parkingBadge.textContent =
    preference === "accessible" ? "Accessible first" : preference === "family" ? "Family friendly" : "EV ready";
}

function renderNotifications() {
  const persona = personas[state.personaIndex];
  elements.prefsSummary.innerHTML = `
    <span class="pref-chip">${persona.name}</span>
    ${persona.tags.map((tag) => `<span class="pref-chip">${tag}</span>`).join("")}
  `;

  const occupancy = zones.reduce((sum, zone) => sum + zone.crowd, 0) / zones.length;
  const congestionLabel = occupancy > 72 ? "busy" : occupancy > 52 ? "steady" : "light";

  const notifications = [
    {
      title: persona.name,
      text: persona.note,
    },
    {
      title: "Crowd trend",
      text: `Overall venue flow is ${congestionLabel}; the AI is weighting quieter corridors and recommending arrival changes in real time.`,
    },
    {
      title: "Delay watch",
      text: state.emergencyMode
        ? "Emergency guidance is suppressing nonessential routes and highlighting the safest exits."
        : "You can save about 6 minutes by shifting your entry to the currently lighter gate.",
    },
  ];

  elements.notificationFeed.innerHTML = notifications
    .map(
      (item) => `
        <div class="feed-item">
          <h4>${item.title}</h4>
          <p>${item.text}</p>
        </div>
      `
    )
    .join("");
}

function updateInsights() {
  const occupancy = Math.round(zones.reduce((sum, zone) => sum + zone.crowd, 0) / zones.length);
  const busiest = [...zones].filter((zone) => zone.type !== "parking").sort((a, b) => b.crowd - a.crowd)[0];
  const quietestParking = [...parkingLots].sort((a, b) => getZone(a.id).crowd - getZone(b.id).crowd)[0];
  const queuePeak = queueLines.reduce(
    (peak, queue) => {
      const wait = queue.base + Math.round((Math.sin(state.tick / 3 + queue.delta) + 1) * 2);
      return wait > peak.wait ? { label: queue.label, wait } : peak;
    },
    { label: "", wait: 0 }
  );

  state.pressure = occupancy;
  elements.occupancyValue.textContent = `${occupancy}%`;
  elements.matchPulse.textContent = String(clamp(Math.round(100 - Math.abs(55 - occupancy) + (state.emergencyMode ? -10 : 0)), 42, 97));
  elements.routeDelayValue.textContent = `${Math.max(2, Math.round(queuePeak.wait / 3))} min`;

  elements.crowdState.textContent = occupancy > 75 ? "Heavy flow" : occupancy > 60 ? "Normal flow" : "Light flow";

  elements.aiInsight.textContent = state.emergencyMode
    ? "Emergency mode is active. Guests are being pushed toward safer exits, while wayfinding suppresses the most crowded corridors and redirects parking to lower-pressure lots."
    : `Crowd AI sees ${busiest.label} as the current pinch point. Steering families to Gate D and parking to ${quietestParking.label} reduces delays by approximately 5 to 7 minutes.`;

  elements.refreshBtn.textContent = `Refresh live network (${Math.max(1, 8 - (state.tick % 7))}s)`;
}

function mutateLiveData() {
  state.tick += 1;

  zones.forEach((zone, index) => {
    if (zone.type === "parking") {
      zone.crowd = clamp(zone.crowd + Math.round(Math.sin(state.tick / 4 + index) * 2), 12, 95);
      zone.level = zone.crowd >= 80 ? "high" : zone.crowd >= 55 ? "medium" : "low";
      return;
    }

    const drift = Math.round(Math.sin(state.tick / 2 + index) * 3 + Math.cos(state.tick / 5 + index) * 2);
    zone.crowd = clamp(zone.crowd + drift, 12, 96);
    zone.level = zone.crowd >= 80 ? "high" : zone.crowd >= 55 ? "medium" : "low";
  });

  queueLines.forEach((queue, index) => {
    queue.base = clamp(queue.base + Math.round(Math.sin(state.tick / 4 + index) * 2), 5, 26);
  });

  renderMap();
  renderZoneDensity();
  renderQueues();
  renderAlerts();
  recommendParking();
  renderRoute();
  renderNotifications();
  updateInsights();

  if (state.emergencyMode) {
    elements.crowdState.textContent = "Critical wayfinding enabled";
    elements.parkingBadge.textContent = "Exit priority";
  }
}

function wireControls() {
  elements.originSelect.innerHTML = allZoneOptions();
  elements.destinationSelect.innerHTML = allZoneOptions();
  elements.originSelect.value = state.selectedOrigin;
  elements.destinationSelect.value = state.selectedDestination;
  elements.preferenceSelect.value = state.preference;

  elements.originSelect.addEventListener("change", (event) => {
    state.selectedOrigin = event.target.value;
    renderRoute();
    recommendParking();
  });

  elements.destinationSelect.addEventListener("change", (event) => {
    state.selectedDestination = event.target.value;
    renderRoute();
    recommendParking();
  });

  elements.preferenceSelect.addEventListener("change", (event) => {
    state.preference = event.target.value;
    renderRoute();
    recommendParking();
  });

  elements.refreshBtn.addEventListener("click", () => {
    mutateLiveData();
  });

  elements.emergencyBtn.addEventListener("click", () => {
    state.emergencyMode = !state.emergencyMode;
    elements.emergencyBtn.textContent = state.emergencyMode ? "Clear emergency mode" : "Trigger emergency mode";
    renderAlerts();
    renderRoute();
    recommendParking();
    updateInsights();
  });

  elements.togglePrefsBtn.addEventListener("click", () => {
    state.personaIndex = (state.personaIndex + 1) % personas.length;
    renderNotifications();
  });
}

function boot() {
  renderMap();
  wireControls();
  mutateLiveData();
  setInterval(mutateLiveData, 5500);
}

boot();
