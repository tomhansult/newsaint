// Cart logic (shared)
let cart = JSON.parse(localStorage.getItem('newSaintCart')) || [];

function saveCart() {
  localStorage.setItem('newSaintCart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else saveCart();
  }
}

function updateCartCount() {
  const countSpan = document.getElementById('cart-count');
  if (countSpan) {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    countSpan.textContent = total;
  }
}

// Cart drawer injection (used on pages that have a cart icon)
function initCartDrawer() {
  const drawerHTML = `
    <div class="cart-overlay" id="cart-overlay"></div>
    <div class="cart-drawer" id="cart-drawer">
      <div class="cart-header">
        <span>Your Cart</span>
        <button id="close-cart">&times;</button>
      </div>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-total" id="cart-total">Total: R0.00</div>
      <button class="checkout-btn" id="checkout-btn">Checkout</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', drawerHTML);

  const cartIcon = document.getElementById('cart-icon');
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  const closeCart = document.getElementById('close-cart');

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('show');
    renderCartItems();
  }
  function closeCartFunc() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  }

  cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });
  closeCart.addEventListener('click', closeCartFunc);
  overlay.addEventListener('click', closeCartFunc);

  document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) alert('Your cart is empty.');
    else alert('Checkout coming soon. The dynamic store is in progress.');
  });

  function renderCartItems() {
    const itemsDiv = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    let total = 0;
    if (cart.length === 0) {
      itemsDiv.innerHTML = '<p>Your cart is empty.</p>';
      totalDiv.textContent = 'Total: R0.00';
      return;
    }
    itemsDiv.innerHTML = cart.map(item => {
      total += item.price * item.qty;
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div>R${item.price}</div>
            <div class="qty-control">
              <button class="qty-btn" data-id="${item.id}" data-delta="-1">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
            </div>
          </div>
          <button class="remove-item" data-id="${item.id}">&times;</button>
        </div>
      `;
    }).join('');
    totalDiv.textContent = `Total: R${total.toFixed(2)}`;

    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.onclick = () => updateQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta));
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.onclick = () => removeFromCart(parseInt(btn.dataset.id));
    });
  }

  // Re-render cart items whenever cart changes (via storage event for cross-tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'newSaintCart') {
      cart = JSON.parse(e.newValue || '[]');
      updateCartCount();
      if (drawer.classList.contains('open')) renderCartItems();
    }
  });
}

// Mobile menu close on link click
document.querySelectorAll('#nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('menu-toggle').checked = false;
  });
});

// Back to top
const btt = document.getElementById('back-to-top');
if (btt) {
  window.addEventListener('scroll', () => {
    btt.classList.toggle('show', window.scrollY > 300);
  });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });
fadeEls.forEach(el => observer.observe(el));

// Newsletter form
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('newsletter-msg');
    msg.textContent = 'You’re in. Let’s build.';
    newsletterForm.reset();
  });
}

// Initialize cart drawer if cart icon exists
if (document.getElementById('cart-icon')) {
  initCartDrawer();
}
updateCartCount();
