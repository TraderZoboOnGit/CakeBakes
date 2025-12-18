// ✅ SET THESE 3 THINGS (then buttons work for real)
const LINKS = {
  // Digits only. Example: "19895551234"
  phoneNumber: "15555551234",

  // Example: "https://www.facebook.com/yourmomspage"
  facebookPageUrl: "https://www.facebook.com/",

  // Example: "https://m.me/yourmomspage"
  messengerUrl: "https://m.me/"
};

const BRAND = {
  name: "Mom’s Sweet Treats",
  subtitle: "Tap photos • Message to order • Local pickup"
};

// Embedded SVG placeholders so you ALWAYS see images (no Unsplash, no broken links)
function svgPlaceholder(title, accent = "pink") {
  const a1 = accent === "pink" ? "#ff4fd8" : accent === "blue" ? "#22d3ee" : "#7c3aed";
  const a2 = accent === "pink" ? "#7c3aed" : accent === "blue" ? "#7c3aed" : "#ff4fd8";
  const safe = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const text = safe(title);

  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a1}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${a2}" stop-opacity="0.85"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="1200" height="900" fill="#0b0715"/>
  <rect x="-80" y="-60" width="1360" height="1020" rx="90" fill="url(#g)" opacity="0.55"/>
  <circle cx="220" cy="220" r="180" fill="#ffffff" opacity="0.08"/>
  <circle cx="980" cy="300" r="220" fill="#ffffff" opacity="0.06"/>
  <circle cx="720" cy="740" r="260" fill="#ffffff" opacity="0.05"/>
  <g filter="url(#shadow)">
    <rect x="90" y="570" width="1020" height="240" rx="42" fill="#07060b" opacity="0.55" stroke="#ffffff" stroke-opacity="0.18"/>
    <text x="140" y="670" fill="#f5f3ff" font-size="64" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-weight="900">${text}</text>
    <text x="140" y="740" fill="rgba(245,243,255,0.75)" font-size="34" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-weight="700">Tap to zoom • Message to order</text>
  </g>
</svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const GALLERY = [
  { title: "Cake Pops (Assorted)", note: "Ask about flavors", img: svgPlaceholder("Cake Pops (Assorted)", "pink") },
  { title: "Birthday Cake", note: "Any theme, any colors", img: svgPlaceholder("Birthday Cake", "purple") },
  { title: "Brownies", note: "Fudgy + rich", img: svgPlaceholder("Brownies", "blue") },
  { title: "Cookies", note: "Soft & chewy", img: svgPlaceholder("Cookies", "pink") },
  { title: "Cupcakes", note: "Party packs", img: svgPlaceholder("Cupcakes", "purple") },
  { title: "Holiday Treat Box", note: "Seasonal specials", img: svgPlaceholder("Holiday Treat Box", "blue") },
  { title: "Chocolate Drizzle Cake", note: "Crowd favorite", img: svgPlaceholder("Chocolate Drizzle Cake", "pink") },
  { title: "Strawberry Treats", note: "Pretty + sweet", img: svgPlaceholder("Strawberry Treats", "purple") },
  { title: "Custom Order", note: "Tell me your idea!", img: svgPlaceholder("Custom Order", "blue") },
];

// DOM
const grid = document.getElementById("grid");
document.getElementById("brandName").textContent = BRAND.name;
document.getElementById("brandSub").textContent = BRAND.subtitle;

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalNote = document.getElementById("modalNote");

// Link elements (real anchors)
const linkText = document.getElementById("linkText");
const linkText2 = document.getElementById("linkText2");
const linkText3 = document.getElementById("linkText3");

const linkFacebook = document.getElementById("linkFacebook");
const linkFacebook2 = document.getElementById("linkFacebook2");
const linkFacebook3 = document.getElementById("linkFacebook3");

const linkMessenger = document.getElementById("linkMessenger");
const linkMessenger2 = document.getElementById("linkMessenger2");
const linkMessenger3 = document.getElementById("linkMessenger3");

// Build SMS link (works better than JS window.open)
function makeSmsLink(itemTitle){
  const num = (LINKS.phoneNumber || "").replace(/\D/g,"");
  if (!num) return "#";
  const body = encodeURIComponent(`Hi! I saw "${itemTitle}" on your site. Is it available?`);
  // This format works on most phones:
  return `sms:${num}?&body=${body}`;
}

function setStaticLinks(){
  // FB + Messenger always valid anchors
  [linkFacebook, linkFacebook2, linkFacebook3].forEach(a => a.href = LINKS.facebookPageUrl || "#");
  [linkMessenger, linkMessenger2, linkMessenger3].forEach(a => a.href = LINKS.messengerUrl || "#");

  // Default text links
  const base = makeSmsLink("a treat");
  [linkText, linkText2, linkText3].forEach(a => a.href = base);
}

function setTextLinksFor(title){
  const sms = makeSmsLink(title);
  [linkText, linkText2, linkText3].forEach(a => a.href = sms);
}

function render(){
  grid.innerHTML = "";
  for (const item of GALLERY){
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `
      <img src="${item.img}" alt="${escapeHtml(item.title)}">
      <div class="cap">
        <div class="name">${escapeHtml(item.title)}</div>
        <div class="tiny">${escapeHtml(item.note || "Tap to zoom")}</div>
      </div>
    `;
    tile.addEventListener("click", () => openModal(item));
    grid.appendChild(tile);
  }
}

function openModal(item){
  modalTitle.textContent = item.title;
  modalNote.textContent = (item.note ? `${item.note} • ` : "") + "Tap Messenger/Text to ask about this one.";
  modalImg.src = item.img;

  setTextLinksFor(item.title);

  modal.classList.add("show");
}

closeModal.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

setStaticLinks();
render();
