// ─── CHECKOUT MODAL ───────────────────────────────────────────────────────────
// Handles the customer ID dialog that appears when the user clicks Checkout.
// Depends on: cart.js — uses `cart`, updateCartUI(), closeCart(), showToast()

// Opens the modal and puts focus in the input field.
function openCheckoutModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('customer-id-input').focus();
}

// Closes the modal and resets the input to a clean state.
function closeCheckoutModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  const input = document.getElementById('customer-id-input');
  input.value = '';
  input.style.borderColor = '#eee';   // clear any red validation highlight
}

// ─── ORDER ID GENERATOR ───────────────────────────────────────────────────────

// Produces a readable, sequential ID: ORD-YYYYMMDD-NNN (e.g. ORD-20260517-003).
// A counter in localStorage survives page reloads and ensures uniqueness.
function generateOrderId() {
  const counter = parseInt(localStorage.getItem('shopOrderCounter') || '0') + 1;
  localStorage.setItem('shopOrderCounter', String(counter));
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${date}-${String(counter).padStart(3, '0')}`;
}

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────

// Validates the customer ID, builds an order object, saves it to localStorage,
// then resets the cart and closes both the modal and the cart sidebar.
function placeOrder() {
  const input      = document.getElementById('customer-id-input');
  const customerId = input.value.trim();

  if (!customerId) {
    input.style.borderColor = '#e94560';   // highlight the empty field in red
    return;
  }

  const order = {
    orderId:    generateOrderId(),
    customerId: customerId,
    date:       new Date().toISOString(),
    // Only store what the order history page needs — skip large image URLs
    items:      cart.map(c => ({ name: c.name, price: c.price, qty: c.qty })),
    total:      parseFloat(cart.reduce((sum, c) => sum + c.price * c.qty, 0).toFixed(2))
  };

  // unshift() prepends so the newest order appears first on the history page
  const orders = JSON.parse(localStorage.getItem('shopOrders') || '[]');
  orders.unshift(order);
  localStorage.setItem('shopOrders', JSON.stringify(orders));

  closeCheckoutModal();
  showToast('Order placed! Thank you!');
  cart = [];
  updateCartUI();
  closeCart();
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────────────

// "Checkout" button in the cart sidebar → open the modal
document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  openCheckoutModal();
});

// "Cancel" button → close without saving
document.getElementById('modal-cancel').addEventListener('click', closeCheckoutModal);

// Clicking outside the modal box (on the dark backdrop) → close
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeCheckoutModal();
});

// "Place Order" button or Enter key → submit
document.getElementById('modal-confirm').addEventListener('click', placeOrder);
document.getElementById('customer-id-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') placeOrder();
});
