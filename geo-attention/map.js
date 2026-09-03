const GROUP_COLORS = {
  "Healthcare": "#22766f",
  "Food & Drink": "#b06e1c",
  "Retail - Clothing": "#b5502a",
  "Retail - General": "#74582a",
  "Beauty & Personal Care": "#a85677",
  "Finance": "#3f6b47",
  "Education": "#3c5c8c",
  "Government & Public": "#675a80",
  "Automotive": "#5c5648",
  "Home Improvement": "#8a5f3f",
  "Lodging": "#a97e26",
  "Entertainment & Leisure": "#2c7566",
  "Professional Services": "#466685",
  "Industrial": "#684838",
  "Agriculture": "#547239",
  "Transportation": "#8a4534"
};
const DEFAULT_COLOR = "#8a8a8a";

async function init() {
  const res = await fetch("data.json");
  const data = await res.json();

  const kermanBounds = L.latLngBounds(
    [30.10, 56.90],
    [30.42, 57.25]
  );

  const map = L.map("map", {
    zoomControl: true,
    maxBounds: kermanBounds.pad(0.1),
    maxBoundsViscosity: 0.8,
    minZoom: 11
  }).setView(data.center, 13);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  ).addTo(map);

  // Group points and build one Leaflet layer per group, so each
  // checkbox in the sidebar just toggles a layer on/off.
  const byGroup = {};
  data.points.forEach((p) => {
    if (!byGroup[p.group]) byGroup[p.group] = [];
    byGroup[p.group].push(p);
  });

  const layers = {};
  Object.keys(byGroup)
    .sort()
    .forEach((group) => {
      const color = GROUP_COLORS[group] || DEFAULT_COLOR;
      const markers = byGroup[group].map((p) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          color: color,
          fillColor: color,
          fillOpacity: 0.85,
          weight: 1
        });
        marker.bindPopup(
          `<p class="popup-title">${escapeHtml(p.name)}</p>` +
          `<p class="popup-meta">${escapeHtml(p.category)}</p>`
        );
        return marker;
      });
      layers[group] = L.layerGroup(markers).addTo(map);
    });

  buildSidebar(byGroup, layers, data.points.length, map);
}

function buildSidebar(byGroup, layers, total, map) {
  const list = document.getElementById("group-list");
  const groups = Object.keys(byGroup).sort();

  document.getElementById("stat-total").innerHTML =
    `<strong>${total}</strong> points across <strong>${groups.length}</strong> categories`;

  groups.forEach((group) => {
    const color = GROUP_COLORS[group] || DEFAULT_COLOR;
    const row = document.createElement("label");
    row.className = "group-item";
    row.innerHTML =
      `<input type="checkbox" checked data-group="${escapeHtml(group)}">` +
      `<span class="swatch" style="background:${color}"></span>` +
      `<span>${escapeHtml(group)}</span>` +
      `<span class="count">${byGroup[group].length}</span>`;
    list.appendChild(row);

    row.querySelector("input").addEventListener("change", (e) => {
      const layer = layers[group];
      if (e.target.checked) {
        layer.addTo(map);
      } else {
        layer.remove();
      }
    });
  });

  document.getElementById("show-all").addEventListener("click", () => {
    list.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      if (!cb.checked) cb.click();
    });
  });
  document.getElementById("hide-all").addEventListener("click", () => {
    list.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      if (cb.checked) cb.click();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();
