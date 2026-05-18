// ─── SAMPLE ORDERS ────────────────────────────────────────────────────────────
// Pre-built orders seeded into localStorage on the first visit so the history
// page always has something to display out of the box.

const sampleOrders = [
  {
    orderId:    'ORD-20260510-001',
    customerId: 'CUST-101',
    date:       '2026-05-10T09:15:00.000Z',
    items: [
      { name: 'Wireless Headphones', price: 79.99, qty: 1 },
      { name: 'Ceramic Coffee Mug',  price: 19.99, qty: 2 }
    ],
    total: 119.97   // 79.99 + (19.99 × 2)
  },
  {
    orderId:    'ORD-20260512-002',
    customerId: 'CUST-042',
    date:       '2026-05-12T14:30:00.000Z',
    items: [
      { name: 'Leather Backpack', price: 54.99, qty: 1 },
      { name: 'Sunglasses',       price: 34.99, qty: 1 }
    ],
    total: 89.98    // 54.99 + 34.99
  },
  {
    orderId:    'ORD-20260514-003',
    customerId: 'CUST-207',
    date:       '2026-05-14T11:05:00.000Z',
    items: [
      { name: 'Mechanical Keyboard', price: 99.99, qty: 1 },
      { name: 'Succulent Plant',     price: 14.99, qty: 2 }
    ],
    total: 129.97   // 99.99 + (14.99 × 2)
  },
  {
    orderId:    'ORD-20260516-004',
    customerId: 'CUST-101',
    date:       '2026-05-16T16:45:00.000Z',
    items: [
      { name: 'Wireless Headphones', price: 79.99, qty: 2 }
    ],
    total: 159.98   // 79.99 × 2
  }
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

// Writes sample orders to localStorage once (guarded by a flag).
// Appends them after any real orders so user-placed orders stay at the top.
function seedOrders() {
  if (localStorage.getItem('shopOrdersSeeded')) return;
  const existing = JSON.parse(localStorage.getItem('shopOrders') || '[]');
  localStorage.setItem('shopOrders', JSON.stringify([...existing, ...sampleOrders]));
  localStorage.setItem('shopOrdersSeeded', 'true');
}

// ─── DATE FORMATTING ──────────────────────────────────────────────────────────

// Converts an ISO 8601 string to a readable local date and time.
// e.g. "2026-05-10T09:15:00.000Z" → "May 10, 2026 at 09:15 AM"
function formatDate(isoString) {
  const d        = new Date(isoString);
  const datePart = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} at ${timePart}`;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

// Seeds sample data (once), reads all orders from localStorage, and builds
// one card per order. Orders are stored newest-first (checkout.js uses unshift),
// so the most recent order is always at the top.
function renderOrders() {
  seedOrders();

  const orders    = JSON.parse(localStorage.getItem('shopOrders') || '[]');
  const container = document.getElementById('orders-container');
  const countEl   = document.getElementById('order-count');
  const toolbar   = document.getElementById('toolbar');

  if (orders.length === 0) {
    countEl.textContent   = '';
    toolbar.style.display = 'none';
    container.innerHTML   = '<p class="no-orders">No orders yet — go add some items to your cart!</p>';
    return;
  }

  countEl.textContent   = `${orders.length} order${orders.length !== 1 ? 's' : ''} on file`;
  toolbar.style.display = 'flex';

  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div>
          <span class="order-id">${order.orderId}</span>
          <span class="order-customer">Customer: ${order.customerId}</span>
        </div>
        <span class="order-date">${formatDate(order.date)}</span>
      </div>
      <div class="order-items">
        <table>
          <thead>
            <tr>
              <th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="order-footer">
        <span>Order Total</span>
        <span class="order-total">$${order.total.toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

// ─── CLEAR HISTORY ────────────────────────────────────────────────────────────

// Wipes all order data from localStorage and re-renders the empty state.
// The seed flag is cleared too, so samples reappear on the next page visit.
document.getElementById('clear-btn').addEventListener('click', () => {
  if (!confirm('Clear all order history? This cannot be undone.')) return;
  localStorage.removeItem('shopOrders');
  localStorage.removeItem('shopOrdersSeeded');
  localStorage.removeItem('shopOrderCounter');
  renderOrders();
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderOrders();
