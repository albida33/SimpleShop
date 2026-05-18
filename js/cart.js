// ─── CART STATE ───────────────────────────────────────────────────────────────
// In-memory array of cart items. Each entry is a copy of a product object
// (from products.js) with an added `qty` field.
// Depends on: products.js (must be loaded first via the <script> order in HTML)

let cart = [];

// ─── CART OPERATIONS ──────────────────────────────────────────────────────────

// Adds a product to the cart. If it is already there, increments its qty.
function addToCart(id) {
  const product  = products.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  showToast(`${product.name} added to cart`);
}

// Removes a product from the cart by id, then refreshes the sidebar.
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

// ─── CART UI ──────────────────────────────────────────────────────────────────

// Redraws the header badge, running total, and item list to match cart state.
function updateCartUI() {
  // Header badge — total number of individual items across all quantities
  const count = cart.reduce((sum, c) => sum + c.qty, 0);
  document.getElementById('cart-count').textContent = count;

  // Running total — sum of (price × qty) for every item
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

  // Item list inside the sidebar
  const itemsEl = document.getElementById('cart-items');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    return;
  }

  itemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.image}" alt="${c.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}${c.qty > 1 ? ` x${c.qty}` : ''}</div>
        <div class="cart-item-price">$${(c.price * c.qty).toFixed(2)}</div>
      </div>
      <button class="remove-item" onclick="removeFromCart(${c.id})">&times;</button>
    </div>
  `).join('');
}

// ─── SIDEBAR OPEN / CLOSE ─────────────────────────────────────────────────────

// Toggles the .open class; CSS handles the slide animation.
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

// Shows a brief notification at the bottom of the screen, then hides it.
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────

document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

// ─── INIT ─────────────────────────────────────────────────────────────────────

renderProducts();   // defined in products.js — draws the product grid
updateCartUI();     // sets the initial empty-cart state
