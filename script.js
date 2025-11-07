
// ---------- Smooth scroll to top button ----------
const scrollToTopBtn = document.getElementById('scrollToTop');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.style.display = 'flex';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ---------- Shopping cart logic ----------
const CART_KEY = 'arms_seats_cart_v1';
let cart = {};

// Elements
const cartBtn = document.getElementById('cartBtn');
const cartDropdown = document.getElementById('cartDropdown');
const cartCountEl = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');

// Initialize
function loadCart() {
    try {
        const saved = localStorage.getItem(CART_KEY);
        cart = saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error('Failed to load cart', e);
        cart = {};
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}

function renderCart() {
    // update badge and total
    cartCountEl.textContent = getCartCount();
    cartTotalEl.textContent = getCartTotal().toLocaleString('en-NG');

    // render items
    cartItemsEl.innerHTML = '';
    if (Object.keys(cart).length === 0) {
        cartItemsEl.innerHTML = '<div class="empty">Your cart is empty</div>';
        return;
    }

    Object.values(cart).forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.dataset.id = item.id;

        row.innerHTML = `
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-price">₦${item.price.toLocaleString('en-NG')}</div>
            </div>
            <div class="item-controls">
                <input type="number" min="1" value="${item.qty}" aria-label="Quantity for ${escapeHtml(item.name)}" class="item-qty" />
                <button class="remove-item" title="Remove ${escapeHtml(item.name)}">&times;</button>
            </div>
        `;

        // quantity change
        const qtyInput = row.querySelector('.item-qty');
        qtyInput.addEventListener('change', (e) => {
            let v = parseInt(e.target.value, 10);
            if (isNaN(v) || v < 1) v = 1;
            updateItemQuantity(item.id, v);
        });

        // remove
        const removeBtn = row.querySelector('.remove-item');
        removeBtn.addEventListener('click', () => {
            removeItem(item.id);
        });

        cartItemsEl.appendChild(row);
    });
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function addItem(product) {
    if (cart[product.id]) {
        cart[product.id].qty += 1;
    } else {
        cart[product.id] = { ...product, qty: 1 };
    }
    saveCart();
    renderCart();
    
    // Show success notification
    Swal.fire({
        title: 'Added to Cart!',
        text: `${product.name} has been added to your cart`,
        icon: 'success',
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        background: '#fff',
        iconColor: '#B86549',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
        }
    });
}

function updateItemQuantity(id, qty) {
    if (!cart[id]) return;
    cart[id].qty = qty;
    if (cart[id].qty <= 0) delete cart[id];
    saveCart();
    renderCart();
}

function removeItem(id) {
    const itemName = cart[id]?.name || 'Item';
    if (cart[id]) delete cart[id];
    saveCart();
    renderCart();
    
    // Show remove notification
    Swal.fire({
        title: 'Removed from Cart',
        text: `${itemName} has been removed`,
        icon: 'info',
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        background: '#fff',
        iconColor: '#B86549',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
        }
    });
}

function clearCart() {
    cart = {};
    saveCart();
    renderCart();
    
    // Show clear notification
    Swal.fire({
        title: 'Cart Cleared',
        text: 'All items have been removed from your cart',
        icon: 'info',
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        background: '#fff',
        iconColor: '#B86549',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            content: 'swal-custom-content'
        }
    });
}

// wire Add to Cart buttons
function setupAddToCartButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
        const btn = card.querySelector('.addToCart');
        if (!btn) return;
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price) || 0;
        btn.addEventListener('click', () => {
            addItem({ id, name, price });
            // open dropdown briefly for feedback
            openCartDropdown();
        });
    });
}

// cart dropdown toggle
function openCartDropdown() {
    cartDropdown.setAttribute('aria-hidden', 'false');
    cartBtn.setAttribute('aria-expanded', 'true');
    cartDropdown.style.display = 'block';
}

function closeCartDropdown() {
    cartDropdown.setAttribute('aria-hidden', 'true');
    cartBtn.setAttribute('aria-expanded', 'false');
    cartDropdown.style.display = 'none';
}

cartBtn.addEventListener('click', (e) => {
    const isHidden = cartDropdown.getAttribute('aria-hidden') === 'true';
    if (isHidden) openCartDropdown(); else closeCartDropdown();
});

// close when clicking outside
document.addEventListener('click', (e) => {
    const target = e.target;
    if (!cartDropdown.contains(target) && !cartBtn.contains(target)) {
        closeCartDropdown();
    }
});

clearCartBtn.addEventListener('click', () => {
    clearCart();
});

// ---------- Checkout modal wiring ----------
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const checkoutSummary = document.getElementById('checkoutSummary');
const confirmCheckoutBtn = document.getElementById('confirmCheckout');
const cancelCheckoutBtn = document.getElementById('cancelCheckout');

function openCheckoutModal() {
    // populate summary
    const items = Object.values(cart);
    if (items.length === 0) {
        checkoutSummary.innerHTML = '<div class="empty">Your cart is empty</div>';
    } else {
        checkoutSummary.innerHTML = items.map(it => `
            <div class="summary-item">
                <div>${escapeHtml(it.name)} x ${it.qty}</div>
                <div>₦${(it.price * it.qty).toLocaleString('en-NG')}</div>
            </div>
        `).join('') + `<div class="summary-total">Total: ₦${getCartTotal().toLocaleString('en-NG')}</div>`;
    }
    checkoutModal.setAttribute('aria-hidden', 'false');
}

function closeCheckoutModal() {
    checkoutModal.setAttribute('aria-hidden', 'true');
}

checkoutBtn.addEventListener('click', () => {
    openCheckoutModal();
});

cancelCheckoutBtn.addEventListener('click', () => {
    closeCheckoutModal();
});

modalBackdrop.addEventListener('click', () => {
    closeCheckoutModal();
});

confirmCheckoutBtn.addEventListener('click', () => {
    // Simulate successful checkout
    alert('Thank you for your purchase! Total: ₦' + getCartTotal().toLocaleString('en-NG'));
    clearCart();
    closeCheckoutModal();
    closeCartDropdown();
});

// init all
loadCart();
renderCart();
setupAddToCartButtons();