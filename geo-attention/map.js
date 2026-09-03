const GROUP_COLORS = {
  "Healthcare": "#2f8f8b",
  "Food & Drink": "#c9862b",
  "Retail - Clothing": "#b5502a",
  "Retail - General": "#8a6d3b",
  "Beauty & Personal Care": "#c97c9b",
  "Finance": "#4c7a54",
  "Education": "#4e6fa3",
  "Government & Public": "#7a6c93",
  "Automotive": "#6e6659",
  "Home Improvement": "#a0785a",
  "Lodging": "#d4a24c",
  "Entertainment & Leisure": "#3e8e7e",
  "Professional Services": "#5b7c99",
  "Industrial": "#7a5c4e",
  "Agriculture": "#6b8e4e",
  "Transportation": "#a15843"
};
const DEFAULT_COLOR = "#8a8a8a";

async function init() {
  const res = await fetch("data.json");
  const data = await res.json();

  const map = L.map("map", { zoomControl: true }).setView(data.center, 13);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
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
