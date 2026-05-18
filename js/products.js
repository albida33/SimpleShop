// ─── PRODUCT CATALOGUE ────────────────────────────────────────────────────────
// Single source of truth for all items shown on the shop page.
// Add, remove, or edit entries here to update the product listing.

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    desc: "Premium sound with 30hr battery life",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    name: "Leather Backpack",
    desc: "Stylish and durable everyday carry",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Succulent Plant",
    desc: "Low-maintenance desk companion",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "Ceramic Coffee Mug",
    desc: "Hand-crafted 12oz mug, microwave safe",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    desc: "Tactile switches, RGB backlit",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    name: "Sunglasses",
    desc: "UV400 polarized lenses, classic frame",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop"
  }
];

// Builds a product card for every entry in `products` and injects them into
// #product-grid. Called once during page initialisation (from cart.js).
function renderProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}
