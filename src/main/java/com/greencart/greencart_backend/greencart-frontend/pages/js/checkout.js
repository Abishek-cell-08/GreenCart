// Checkout JavaScript for GreenCart

let orderSummary = {
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    // Check if user is logged in
    const currentUser = window.GreenCart ? window.GreenCart.currentUser : null;
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if cart has items
    const cart = window.GreenCart ? window.GreenCart.cart : [];
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Load user data into form
    loadUserData();
    
    // Display order summary
    displayOrderSummary();
    
    // Setup event listeners
    setupCheckoutEventListeners();
    
    // Calculate totals
    calculateOrderTotals();
}

function loadUserData() {
    const currentUser = window.ShopEase ? window.ShopEase.currentUser : null;
    
    if (!currentUser) return;
    
    // Pre-fill shipping form with user data
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const phone = document.getElementById('phone');
    
    if (firstName) firstName.value = currentUser.firstName || '';
    if (lastName) lastName.value = currentUser.lastName || '';
    if (phone) phone.value = currentUser.phone || '';
    
    // Load saved addresses if available
    loadSavedAddresses();
}

function loadSavedAddresses() {
    const currentUser = window.ShopEase ? window.ShopEase.currentUser : null;
    
    if (!currentUser) return;
    
    // Get user data from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    if (user && user.addresses && user.addresses.length > 0) {
        const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
        
        if (defaultAddress) {
            const address = document.getElementById('address');
            const city = document.getElementById('city');
            const state = document.getElementById('state');
            const zipCode = document.getElementById('zipCode');
            
            if (address) address.value = defaultAddress.address || '';
            if (city) city.value = defaultAddress.city || '';
            if (state) state.value = defaultAddress.state || '';
            if (zipCode) zipCode.value = defaultAddress.zipCode || '';
        }
    }
}

function setupCheckoutEventListeners() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
    
    // Form validation on input
    const requiredFields = document.querySelectorAll('input[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
}

function handlePaymentMethodChange(e) {
    const cardPayment = document.getElementById('cardPayment');
    
    if (e.target.value === 'card') {
        if (cardPayment) cardPayment.style.display = 'block';
    } else {
        if (cardPayment) cardPayment.style.display = 'none';
    }
}

function displayOrderSummary() {
    const cart = window.ShopEase ? window.ShopEase.cart : [];
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                ${item.size ? `<span class="item-size">Size: ${item.size}</span>` : ''}
            </div>
            <div class="item-quantity">x${item.quantity}</div>
            <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
    
    orderSummary.items = [...cart];
}

function calculateOrderTotals() {
    const cart = window.ShopEase ? window.ShopEase.cart : [];
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;
    
    orderSummary.subtotal = subtotal;
    orderSummary.shipping = shipping;
    orderSummary.tax = tax;
    orderSummary.total = total;
    
    // Update display
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
    if (taxEl) taxEl.textContent = formatPrice(tax);
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Basic validation
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('error');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            field.classList.add('error');
            return false;
        }
    }
    
    return true;
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Validate payment method specific fields
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (selectedPaymentMethod && selectedPaymentMethod.value === 'card') {
        const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
        cardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }
        });
    }
    
    return isValid;
}

function placeOrder() {
    // Validate form
    if (!validateForm()) {
        if (window.ShopEase && window.ShopEase.showMessage) {
            window.ShopEase.showMessage('Please fill in all required fields correctly', 'error');
        }
        return;
    }
    
    // Collect order data
    const orderData = collectOrderData();
    
    // Process order
    processOrder(orderData);
}

function collectOrderData() {
    const currentUser = window.ShopEase ? window.ShopEase.currentUser : null;
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    return {
        orderId: generateOrderId(),
        userId: currentUser ? currentUser.id : null,
        items: [...orderSummary.items],
        shippingInfo: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            phone: document.getElementById('phone').value
        },
        paymentInfo: {
            method: selectedPaymentMethod ? selectedPaymentMethod.value : 'card',
            cardNumber: selectedPaymentMethod && selectedPaymentMethod.value === 'card' ? 
                document.getElementById('cardNumber').value.replace(/\s/g, '') : null
        },
        orderSummary: { ...orderSummary },
        orderDate: new Date().toISOString(),
        status: 'processing'
    };
}

function processOrder(orderData) {
    // Show loading state
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Processing Order...';
    }
    
    // Simulate order processing
    setTimeout(() => {
        // Save order to localStorage
        saveOrder(orderData);
        
        // Clear cart
        if (window.ShopEase) {
            window.ShopEase.cart = [];
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        // Show success message
        if (window.ShopEase && window.ShopEase.showMessage) {
            window.ShopEase.showMessage('Order placed successfully!', 'success');
        }
        
        // Redirect to order confirmation
        setTimeout(() => {
            window.location.href = `order-confirmation.html?orderId=${orderData.orderId}`;
        }, 2000);
        
    }, 2000);
}

function saveOrder(orderData) {
    // Save to orders list
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Save to user's order history
    const currentUser = window.ShopEase ? window.ShopEase.currentUser : null;
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            if (!users[userIndex].orders) {
                users[userIndex].orders = [];
            }
            users[userIndex].orders.push(orderData.orderId);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Utility functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Credit card number formatting
document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
            e.target.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
});
