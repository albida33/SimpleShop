# Simple Shop

A lightweight e-commerce demo built with plain HTML, CSS, and JavaScript — no frameworks, no build tools, no installation required.

---

## Project Structure

```
project1/
├── index.html          # Shop page — product grid and cart
├── orders.html         # Order history page
├── css/
│   ├── base.css        # Shared styles (header, nav, toast)
│   ├── shop.css        # Product grid, cart sidebar, checkout modal
│   └── orders.css      # Order cards and items table
└── js/
    ├── products.js     # Product catalogue data + render function
    ├── cart.js         # Cart state, sidebar, and toast logic
    ├── checkout.js     # Customer ID modal and order save logic
    └── orders.js       # Order history display and sample data
```

---

## How to Run

```bash
npx serve .
```

Then open the URL printed in the terminal (usually `http://localhost:3000`).

## Using the App

### Shop page (`index.html`)

| Action | How |
|---|---|
| Browse products | Products load automatically on the page |
| Add to cart | Click **Add to Cart** on any product card |
| View cart | Click the **Cart (n)** button in the top-right |
| Remove an item | Click **×** next to the item in the cart sidebar |
| Checkout | Click **Checkout**, enter a Customer ID (e.g. `CUST-001`), then click **Place Order** |
| View order history | Click **Order History** in the header |

### Order History page (`orders.html`)

- Displays all past orders, newest first.
- Four sample orders are pre-loaded on the first visit.
- Each order shows the Order ID, Customer ID, date/time, itemised list, and total.
- Click **Clear History** to wipe all orders (sample data reappears on the next visit).

Orders are stored in your browser's **localStorage** — they persist across page refreshes but are tied to the browser you use.

---

## Customising the Products

To add, remove, or change products, edit the `products` array at the top of `js/products.js`:

```js
{
  id: 7,                          // must be unique
  name: "Your Product Name",
  desc: "Short description here",
  price: 29.99,
  image: "https://..."            // any image URL
}
```

No other files need to be changed.

---

## Data Persistence

All data is stored in the browser's **localStorage** under these keys:

| Key | Contents |
|---|---|
| `shopOrders` | JSON array of all placed orders |
| `shopOrdersSeeded` | Flag that prevents sample orders from being re-inserted |
| `shopOrderCounter` | Sequential counter used to generate Order IDs |

To reset everything to a clean state, open the browser console (`F12`) and run:
```js
localStorage.clear();
```
