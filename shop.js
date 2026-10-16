/* Stop the page from auto-scrolling on open/reload (smooth scrolling stays for clicks). */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
document.documentElement.style.scrollBehavior = "auto";
window.addEventListener("load", () => {
  const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
  requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = ""; });
});

/* Shared logic for women.html, men.html and accessories.html */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = v => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(v);
const CART_KEY = "cjfinds-cart";

/* Sample catalogue — swap names, prices and image URLs for your real stock.
   type: casual | formal | sports   (prices follow the 199 / 299 / 399 / 499 filters) */
const IMG = {
  knit: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85",
  blazer: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
  tote: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
  women: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
  men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85",
  bag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
  fashion: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85"
};
const CATALOG = {
  women: [
    { name: "Everyday Knit", note: "Soft-touch essential", price: 299, type: "casual", img: IMG.knit },
    { name: "Tailored Blazer", note: "Modern relaxed fit", price: 499, type: "formal", img: IMG.blazer },
    { name: "Sage Linen Top", note: "Breezy and light", price: 199, type: "casual", img: IMG.fashion },
    { name: "Pleated Midi Skirt", note: "Office to dinner", price: 399, type: "formal", img: IMG.women },
    { name: "Active Crop Set", note: "Stretchy, gym-ready", price: 299, type: "sports", img: IMG.knit },
    { name: "Wrap Dress", note: "Pre-loved favorite", price: 499, type: "formal", img: IMG.fashion }
  ],
  men: [
    { name: "Classic Oxford Shirt", note: "Crisp and clean", price: 299, type: "formal", img: IMG.men },
    { name: "Black Minimal Tee", note: "Everyday staple", price: 199, type: "casual", img: IMG.men },
    { name: "Slim Chino Pants", note: "Easy smart-casual", price: 399, type: "casual", img: IMG.blazer },
    { name: "Wool-Blend Blazer", note: "Sharp, lightly worn", price: 499, type: "formal", img: IMG.blazer },
    { name: "Performance Jersey", note: "Quick-dry fabric", price: 199, type: "sports", img: IMG.men },
    { name: "Track Shorts", note: "Light and flexible", price: 299, type: "sports", img: IMG.knit }
  ],
  accessories: [
    { name: "Everyday Tote", note: "Room for everything", price: 499, type: "casual", img: IMG.tote },
    { name: "Leather Crossbody", note: "Compact and chic", price: 399, type: "formal", img: IMG.bag },
    { name: "Canvas Gym Bag", note: "Tough and roomy", price: 299, type: "sports", img: IMG.bag },
    { name: "Silk Scarf", note: "Soft blush print", price: 199, type: "casual", img: IMG.fashion },
    { name: "Classic Belt", note: "Polished finish", price: 199, type: "formal", img: IMG.tote },
    { name: "Sport Cap", note: "Adjustable fit", price: 199, type: "sports", img: IMG.men }
  ]
};
const PAGE = document.body.dataset.page;
const products = CATALOG[PAGE] || [];
const filters = { type: "all", max: Infinity, term: "" };
let cart = [];
let toastTimer;

function loadCart() {
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
}
function toast(message) {
  const node = $(".toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 2300);
}

/* ---------- Products ---------- */
function renderProducts() {
  const grid = $(".product-grid");
  grid.innerHTML = "";
  products.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <button class="favorite" aria-label="Add ${p.name} to favorites">♡</button>
      <div class="product-photo" role="img" aria-label="${p.name}" style="background-image:url('${p.img}')"></div>
      <div class="product-info"><div><h3>${p.name}</h3><p>${p.note}</p><span class="product-tag">${p.type}</span></div><strong>${money(p.price)}</strong></div>
      <button class="add-product">Add to bag <span>+</span></button>`;
    $(".favorite", card).addEventListener("click", e => {
      const b = e.currentTarget;
      b.classList.toggle("liked");
      b.textContent = b.classList.contains("liked") ? "♥" : "♡";
      toast(b.classList.contains("liked") ? "Added to your favorites." : "Removed from favorites.");
    });
    $(".add-product", card).addEventListener("click", () => addToCart(p.name, p.price));
    card._product = p;
    grid.appendChild(card);
  });
  const empty = document.createElement("p");
  empty.className = "no-results";
  empty.hidden = true;
  empty.textContent = "No finds match those filters yet. Try another one!";
  grid.appendChild(empty);
  applyFilters();
}
function applyFilters() {
  let shown = 0;
  $$(".product-card").forEach(card => {
    const p = card._product;
    const ok = (filters.type === "all" || p.type === filters.type) &&
      p.price <= filters.max &&
      (!filters.term || `${p.name} ${p.note} ${p.type}`.toLowerCase().includes(filters.term));
    card.hidden = !ok;
    if (ok) shown++;
  });
  $(".no-results").hidden = shown !== 0;
  $(".result-count").textContent = `${shown} find${shown === 1 ? "" : "s"}`;
}

/* ---------- Cart ---------- */
function addToCart(name, price) {
  const found = cart.find(i => i.name === name && i.price === Number(price));
  if (found) found.quantity += 1; else cart.push({ name, price: Number(price), quantity: 1 });
  renderCart();
  toast(`${name} added to your bag.`);
}
function changeQuantity(item, amount) {
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(i => i !== item);
  renderCart();
}
function renderCart() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 2000 ? 150 : 0;
  $(".cart-count").textContent = count;
  $(".bag-heading-count").textContent = `(${count})`;
  const box = $(".cart-items");
  box.innerHTML = "";
  if (!cart.length) {
    const p = document.createElement("p");
    p.className = "empty-cart";
    p.textContent = "Your bag is waiting for something lovely.";
    box.appendChild(p);
  } else {
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-line";
      const details = document.createElement("div");
      const h = document.createElement("h3"); h.textContent = item.name;
      const pr = document.createElement("p"); pr.textContent = `${money(item.price)} each`;
      const controls = document.createElement("div"); controls.className = "quantity-controls";
      const minus = document.createElement("button");
      minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", `Remove one ${item.name}`);
      minus.addEventListener("click", () => changeQuantity(item, -1));
      const q = document.createElement("span"); q.textContent = item.quantity;
      const plus = document.createElement("button");
      plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", `Add one ${item.name}`);
      plus.addEventListener("click", () => changeQuantity(item, 1));
      controls.append(minus, q, plus);
      details.append(h, pr, controls);
      const total = document.createElement("strong"); total.textContent = money(item.price * item.quantity);
      row.append(details, total);
      box.appendChild(row);
    });
  }
  $(".subtotal").textContent = money(subtotal);
  $(".shipping").textContent = subtotal === 0 ? "Calculated at checkout" : (shipping ? money(shipping) : "Free");
  $(".total").textContent = money(subtotal + shipping);
  $(".checkout-button").disabled = count === 0;
  saveCart();
}

/* ---------- Page wiring ---------- */
function setActive(group, button) {
  $$(group).forEach(b => b.classList.toggle("active", b === button));
}
$$("[data-filter]").forEach(b => b.addEventListener("click", () => {
  setActive("[data-filter]", b);
  filters.type = b.dataset.filter;
  applyFilters();
}));
$$("[data-max]").forEach(b => b.addEventListener("click", () => {
  setActive("[data-max]", b);
  filters.max = b.dataset.max === "all" ? Infinity : Number(b.dataset.max);
  applyFilters();
}));

$(".menu-toggle").addEventListener("click", () => {
  const panel = $(".mobile-menu");
  const open = panel.hidden;
  panel.hidden = !open;
  $(".menu-toggle").setAttribute("aria-expanded", String(open));
});
$(".search-toggle").addEventListener("click", () => {
  const panel = $(".search-panel");
  panel.hidden = !panel.hidden;
  $(".search-toggle").setAttribute("aria-expanded", String(!panel.hidden));
  if (!panel.hidden) $("#search-input").focus();
});
$(".search-panel").addEventListener("submit", e => {
  e.preventDefault();
  filters.term = $("#search-input").value.trim().toLowerCase();
  applyFilters();
  $(".search-message").textContent = filters.term ? `Showing results for “${$("#search-input").value.trim()}”.` : "Showing all finds.";
  $("#catalog").scrollIntoView({ behavior: "smooth" });
});
$(".cart-toggle").addEventListener("click", () => $("#cart-panel").scrollIntoView({ behavior: "smooth", block: "center" }));
$(".checkout-button").addEventListener("click", () => {
  if (cart.length) toast("Checkout preview only — Cash on Delivery and QR will be connected here.");
});
$("#year").textContent = new Date().getFullYear();

loadCart();
renderProducts();
renderCart();
