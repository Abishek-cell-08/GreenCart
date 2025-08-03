// Cart JavaScript for GreenCart

document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
});

function initializeCart() {
    // Load and display cart items
    displayCartItems();
    
    // Setup event listeners
    setupCartEventListeners();
    
    // Update cart summary
    updateCartSummary();
}

function setupCartEventListeners() {
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!cartItemsContainer) return;
    
    // Get cart data from main.js
    const cart = window.ShopEase ? window.ShopEase.cart : [];
    
    if (cart.length === 0) {
        cartItemsContainer.classList.add('hidden');
        if (emptyCart) emptyCart.classList.remove('hidden');
        return;
    }
    
    cartItemsContainer.classList.remove('hidden');
    if (emptyCart) emptyCart.classList.add('hidden');
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItem);
    });
}

function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.dataset.productId = item.id;
    cartItem.dataset.size = item.size || '';
    
    cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="display: none; align-items: center; justify-content: center; width: 100px; height: 100px; background: #f8f9fa; border-radius: 5px; font-size: 2rem; color: #dee2e6;">
            <i class="fas fa-image"></i>
        </div>
        <div class="item-details">
            <h4>${item.name}</h4>
            ${item.size ? `<p>Size: ${item.size}</p>` : ''}
            <div class="item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="quantity-controls">
            <button onclick="updateItemQuantity(${item.id}, '${item.size || ''}', ${item.quantity - 1})">-</button>
            <input type="number" value="${item.quantity}" min="1" onchange="updateItemQuantity(${item.id}, '${item.size || ''}', this.value)">
            <button onclick="updateItemQuantity(${item.id}, '${item.size || ''}', ${item.quantity + 1})">+</button>
        </div>
        <div class="item-total">
            ${formatPrice(item.price * item.quantity)}
        </div>
        <button class="remove-btn" onclick="removeCartItem(${item.id}, '${item.size || ''}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return cartItem;
}

function updateItemQuantity(productId, size, newQuantity) {
    const quantity = parseInt(newQuantity);
    
    if (quantity <= 0) {
        removeCartItem(productId, size);
        return;
    }
    
    if (window.ShopEase && window.ShopEase.updateCartItemQuantity) {
        window.ShopEase.updateCartItemQuantity(productId, size, quantity);
        
        // Refresh display
        displayCartItems();
        updateCartSummary();
    }
}

function removeCartItem(productId, size) {
    if (window.ShopEase && window.ShopEase.removeFromCart) {
        window.ShopEase.removeFromCart(productId, size);
        
        // Refresh display
        displayCartItems();
        updateCartSummary();
        
        // Show message
        if (window.ShopEase.showMessage) {
            window.ShopEase.showMessage('Item removed from cart', 'info');
        }
    }
}

function updateCartSummary() {
    const cart = window.ShopEase ? window.ShopEase.cart : [];
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal >= 50 ? 0 : 9.99) : 0; // Free shipping over $50
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;
    
    // Update display
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (totalEl) totalEl.textContent = formatPrice(total);
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        if (cart.length === 0) {
            checkoutBtn.textContent = 'Cart is Empty';
            checkoutBtn.style.background = '#6c757d';
        } else {
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.style.background = '#28a745';
        }
    }
}

function proceedToCheckout() {
    const cart = window.ShopEase ? window.ShopEase.cart : [];
    
    if (cart.length === 0) {
        if (window.ShopEase && window.ShopEase.showMessage) {
            window.ShopEase.showMessage('Your cart is empty', 'error');
        }
        return;
    }
    
    // Check if user is logged in
    const currentUser = window.ShopEase ? window.ShopEase.currentUser : null;
    
    if (!currentUser) {
        if (window.ShopEase && window.ShopEase.showMessage) {
            window.ShopEase.showMessage('Please login to proceed to checkout', 'error');
        }
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Proceed to checkout
    window.location.href = 'checkout.html';
}

// Utility functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Apply coupon functionality (bonus feature)
function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    if (!couponInput) return;
    
    const couponCode = couponInput.value.trim().toUpperCase();
    
    // Sample coupon codes
    const coupons = {
        'SAVE10': { discount: 0.10, type: 'percentage' },
        'SAVE20': { discount: 0.20, type: 'percentage' },
        'FREESHIP': { discount: 9.99, type: 'shipping' }
    };
    
    if (coupons[couponCode]) {
        const coupon = coupons[couponCode];
        // Apply coupon logic here
        if (window.ShopEase && window.ShopEase.showMessage) {
            window.ShopEase.showMessage(`Coupon ${couponCode} applied successfully!`, 'success');
        }
    } else {
        if (window.ShopEase && window.ShopEase.showMessage) {
            window.ShopEase.showMessage('Invalid coupon code', 'error');
        }
    }
}
