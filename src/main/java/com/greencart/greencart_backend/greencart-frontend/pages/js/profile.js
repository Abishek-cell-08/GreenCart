// Profile JavaScript for GreenCart

let currentUser = null;
let userOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    // Check if user is logged in
    currentUser = window.GreenCart ? window.GreenCart.currentUser : null;
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    loadUserProfile();
    
    // Setup event listeners
    setupProfileEventListeners();
    
    // Load initial tab content
    showTab('personal');
    
    // Setup enhanced features
    setupEnhancedFeatures();
}

function loadUserProfile() {
    // Update user info display
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) {
        userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (userEmail) {
        userEmail.textContent = currentUser.email;
    }
    
    // Load full user data from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const fullUserData = users.find(u => u.id === currentUser.id);
    
    if (fullUserData) {
        // Pre-fill personal information form
        fillPersonalInfoForm(fullUserData);
        
        // Load user orders
        loadUserOrders(fullUserData);
        
        // Load addresses
        loadUserAddresses(fullUserData);
        
        // Load wishlist
        loadUserWishlist();
    }
}

function fillPersonalInfoForm(userData) {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const dateOfBirth = document.getElementById('dateOfBirth');
    
    if (firstName) firstName.value = userData.firstName || '';
    if (lastName) lastName.value = userData.lastName || '';
    if (email) email.value = userData.email || '';
    if (phone) phone.value = userData.phone || '';
    if (dateOfBirth && userData.dateOfBirth) dateOfBirth.value = userData.dateOfBirth;
}

function setupProfileEventListeners() {
    // Tab navigation
    const profileNavLinks = document.querySelectorAll('.profile-nav-link');
    profileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            showTab(tabId);
            
            // Update active nav link
            profileNavLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Personal info form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', savePersonalInfo);
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }
    
    // Add address button
    const addAddressBtn = document.getElementById('addAddressBtn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', showAddAddressForm);
    }
    
    // Notification settings
    const saveNotificationSettings = document.getElementById('saveNotificationSettings');
    if (saveNotificationSettings) {
        saveNotificationSettings.addEventListener('click', saveNotificationPreferences);
    }
}

function showTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Load tab-specific content
    switch (tabId) {
        case 'orders':
            displayUserOrders();
            break;
        case 'addresses':
            displayUserAddresses();
            break;
        case 'wishlist':
            displayUserWishlist();
            break;
    }
}

function savePersonalInfo(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updatedData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth')
    };
    
    // Update user data in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user session
        const updatedUser = { ...currentUser, ...updatedData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update global reference
        if (window.ShopEase) {
            window.ShopEase.currentUser = updatedUser;
        }
        
        // Update display
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (userName) {
            userName.textContent = `${updatedData.firstName} ${updatedData.lastName}`;
        }
        if (userEmail) {
            userEmail.textContent = updatedData.email;
        }
        
        showProfileMessage('Personal information updated successfully!', 'success');
    }
}

function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showProfileMessage('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showProfileMessage('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showProfileMessage('New password must be at least 6 characters long', 'error');
        return;
    }
    
    // Verify current password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user || user.password !== currentPassword) {
        showProfileMessage('Current password is incorrect', 'error');
        return;
    }
    
    // Update password
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Clear form
        document.getElementById('passwordForm').reset();
        
        showProfileMessage('Password changed successfully!', 'success');
    }
}

function loadUserOrders(userData) {
    if (!userData.orders) return;
    
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    userOrders = allOrders.filter(order => userData.orders.includes(order.orderId));
}

function displayUserOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (userOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <h3>No orders yet</h3>
                <p>You haven't placed any orders yet.</p>
                <button onclick="window.location.href='products.html'" class="shop-now-btn">
                    Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    userOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    const statusClass = `status-${order.status.toLowerCase()}`;
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    orderCard.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <h4>Order #${order.orderId}</h4>
                <p>Placed on ${formatDate(order.orderDate)}</p>
                <p>${itemCount} item${itemCount !== 1 ? 's' : ''}</p>
            </div>
            <div class="order-status ${statusClass}">
                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item-summary">
                    <span>${item.name}</span>
                    <span>x${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('')}
        </div>
        <div class="order-total">
            <strong>Total: ${formatPrice(order.orderSummary.total)}</strong>
        </div>
    `;
    
    return orderCard;
}

function loadUserAddresses(userData) {
    // Addresses are already loaded in userData
}

function displayUserAddresses() {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    addressesList.innerHTML = '';
    
    if (!user || !user.addresses || user.addresses.length === 0) {
        addressesList.innerHTML = `
            <div class="no-addresses">
                <p>No saved addresses yet.</p>
            </div>
        `;
        return;
    }
    
    user.addresses.forEach(address => {
        const addressCard = createAddressCard(address);
        addressesList.appendChild(addressCard);
    });
}

function createAddressCard(address) {
    const addressCard = document.createElement('div');
    addressCard.className = 'address-card';
    
    addressCard.innerHTML = `
        <div class="address-header">
            <h4>${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address</h4>
            ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="address-details">
            <p><strong>${address.firstName} ${address.lastName}</strong></p>
            <p>${address.address}</p>
            <p>${address.city}, ${address.state} ${address.zipCode}</p>
            <p>${address.phone}</p>
        </div>
        <div class="address-actions">
            <button onclick="editAddress('${address.id}')" class="edit-btn">Edit</button>
            <button onclick="deleteAddress('${address.id}')" class="delete-btn">Delete</button>
            ${!address.isDefault ? `<button onclick="setDefaultAddress('${address.id}')" class="default-btn">Set as Default</button>` : ''}
        </div>
    `;
    
    return addressCard;
}

function loadUserWishlist() {
    // Wishlist is already loaded in window.ShopEase.wishlist
}

function displayUserWishlist() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;
    
    const wishlist = window.ShopEase ? window.ShopEase.wishlist : [];
    
    wishlistGrid.innerHTML = '';
    
    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="no-wishlist">
                <h3>Your wishlist is empty</h3>
                <p>Add items to your wishlist to see them here.</p>
                <button onclick="window.location.href='products.html'" class="shop-now-btn">
                    Browse Products
                </button>
            </div>
        `;
        return;
    }
    
    wishlist.forEach(item => {
        const wishlistItem = createWishlistItem(item);
        wishlistGrid.appendChild(wishlistItem);
    });
}

function createWishlistItem(item) {
    const wishlistItem = document.createElement('div');
    wishlistItem.className = 'wishlist-item';
    
    wishlistItem.innerHTML = `
        <div class="wishlist-image">
            <img src="${item.image}" alt="${item.name}" onclick="window.location.href='product-detail.html?id=${item.id}'">
        </div>
        <div class="wishlist-info">
            <h4>${item.name}</h4>
            <div class="wishlist-price">${formatPrice(item.price)}</div>
            <div class="wishlist-actions">
                <button onclick="addWishlistItemToCart(${item.id})" class="add-to-cart-btn">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button onclick="removeFromWishlist(${item.id})" class="remove-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return wishlistItem;
}

function addWishlistItemToCart(itemId) {
    const wishlist = window.ShopEase ? window.ShopEase.wishlist : [];
    const item = wishlist.find(i => i.id === itemId);
    
    if (item && window.ShopEase && window.ShopEase.addToCart) {
        window.ShopEase.addToCart(item);
    }
}

function removeFromWishlist(itemId) {
    if (window.ShopEase && window.ShopEase.removeFromWishlist) {
        window.ShopEase.removeFromWishlist(itemId);
        displayUserWishlist(); // Refresh display
    }
}

function showAddAddressForm() {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addAddressForm');
    
    // Pre-fill form with user data
    document.getElementById('addressFirstName').value = currentUser.firstName || '';
    document.getElementById('addressLastName').value = currentUser.lastName || '';
    document.getElementById('addressPhone').value = currentUser.phone || '';
    
    modal.style.display = 'block';
    
    // Handle form submission
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const newAddress = {
            id: 'addr_' + Date.now(),
            type: formData.get('type'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            address: formData.get('address'),
            address2: formData.get('address2') || '',
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode'),
            phone: formData.get('phone'),
            isDefault: document.getElementById('isDefault').checked
        };
        
        // Save address
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            if (!users[userIndex].addresses) {
                users[userIndex].addresses = [];
            }
            
            // If this is set as default, unset other defaults
            if (newAddress.isDefault) {
                users[userIndex].addresses.forEach(addr => addr.isDefault = false);
            }
            
            users[userIndex].addresses.push(newAddress);
            localStorage.setItem('users', JSON.stringify(users));
            
            displayUserAddresses();
            showProfileMessage('Address added successfully!', 'success');
            closeAddressModal();
        }
    };
}

function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.style.display = 'none';
    document.getElementById('addAddressForm').reset();
}

function saveNotificationPreferences() {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;
    const promotionalEmails = document.getElementById('promotionalEmails').checked;
    
    const preferences = {
        emailNotifications,
        smsNotifications,
        promotionalEmails
    };
    
    // Save preferences
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].notificationPreferences = preferences;
        localStorage.setItem('users', JSON.stringify(users));
        
        showProfileMessage('Notification preferences saved!', 'success');
    }
}

function showProfileMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.profile-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `profile-message message ${type}`;
    messageEl.textContent = message;
    
    // Add to profile content
    const profileContent = document.querySelector('.profile-content');
    profileContent.insertBefore(messageEl, profileContent.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Utility functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Enhanced Profile Features
function setupEnhancedFeatures() {
    // Order filtering
    const orderFilter = document.getElementById('orderFilter');
    const orderSearch = document.getElementById('orderSearch');
    
    if (orderFilter) {
        orderFilter.addEventListener('change', filterOrders);
    }
    
    if (orderSearch) {
        orderSearch.addEventListener('input', filterOrders);
    }
    
    // Wishlist actions
    const clearWishlist = document.getElementById('clearWishlist');
    const addAllToCart = document.getElementById('addAllToCart');
    
    if (clearWishlist) {
        clearWishlist.addEventListener('click', clearAllWishlist);
    }
    
    if (addAllToCart) {
        addAllToCart.addEventListener('click', addAllWishlistToCart);
    }
    
    // Enhanced settings
    const savePrivacySettings = document.getElementById('savePrivacySettings');
    const enable2FA = document.getElementById('enable2FA');
    const exportData = document.getElementById('exportData');
    const deactivateAccount = document.getElementById('deactivateAccount');
    const deleteAccount = document.getElementById('deleteAccount');
    
    if (savePrivacySettings) {
        savePrivacySettings.addEventListener('click', savePrivacyPreferences);
    }
    
    if (enable2FA) {
        enable2FA.addEventListener('click', enable2FASetup);
    }
    
    if (exportData) {
        exportData.addEventListener('click', exportUserData);
    }
    
    if (deactivateAccount) {
        deactivateAccount.addEventListener('click', deactivateUserAccount);
    }
    
    if (deleteAccount) {
        deleteAccount.addEventListener('click', deleteUserAccount);
    }
    
    // Modal close functionality
    window.onclick = function(event) {
        const modal = document.getElementById('addressModal');
        if (event.target === modal) {
            closeAddressModal();
        }
    };
}

function filterOrders() {
    const filter = document.getElementById('orderFilter').value;
    const search = document.getElementById('orderSearch').value.toLowerCase();
    
    // This would filter the displayed orders
    // For now, just refresh the display
    displayUserOrders();
}

function clearAllWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
        if (window.ShopEase && window.ShopEase.clearWishlist) {
            window.ShopEase.clearWishlist();
        }
        displayUserWishlist();
        showProfileMessage('Wishlist cleared successfully!', 'success');
    }
}

function addAllWishlistToCart() {
    const wishlist = window.ShopEase ? window.ShopEase.wishlist : [];
    
    if (wishlist.length === 0) {
        showProfileMessage('Your wishlist is empty!', 'info');
        return;
    }
    
    let addedCount = 0;
    wishlist.forEach(item => {
        if (window.ShopEase && window.ShopEase.addToCart) {
            window.ShopEase.addToCart(item);
            addedCount++;
        }
    });
    
    showProfileMessage(`Added ${addedCount} items to cart!`, 'success');
}

function savePrivacyPreferences() {
    const profileVisibility = document.getElementById('profileVisibility').checked;
    const orderHistory = document.getElementById('orderHistory').checked;
    const dataCollection = document.getElementById('dataCollection').checked;
    
    const preferences = {
        profileVisibility,
        orderHistory,
        dataCollection
    };
    
    // Save preferences
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].privacyPreferences = preferences;
        localStorage.setItem('users', JSON.stringify(users));
        
        showProfileMessage('Privacy settings saved!', 'success');
    }
}

function enable2FASetup() {
    alert('Two-Factor Authentication setup would be implemented here.\nThis would typically involve:\n1. QR code generation\n2. Authenticator app setup\n3. Backup codes generation');
}

function exportUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = users.find(u => u.id === currentUser.id);
    
    if (userData) {
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `shopease-data-${currentUser.email}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showProfileMessage('Data export started!', 'success');
    }
}

function deactivateUserAccount() {
    if (confirm('Are you sure you want to deactivate your account?\nYou can reactivate it by logging in again.')) {
        // Mark account as deactivated
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].isActive = false;
            users[userIndex].deactivatedAt = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Account deactivated successfully. You will be logged out.');
            
            // Logout user
            if (window.ShopEase && window.ShopEase.logout) {
                window.ShopEase.logout();
            }
            window.location.href = 'index.html';
        }
    }
}

function deleteUserAccount() {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    
    if (confirmation === 'DELETE') {
        if (confirm('This action cannot be undone. Are you absolutely sure?')) {
            // Remove user data
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const filteredUsers = users.filter(u => u.id !== currentUser.id);
            localStorage.setItem('users', JSON.stringify(filteredUsers));
            
            // Clear user session
            if (window.ShopEase && window.ShopEase.logout) {
                window.ShopEase.logout();
            }
            
            alert('Account deleted successfully.');
            window.location.href = 'index.html';
        }
    } else if (confirmation !== null) {
        showProfileMessage('Account deletion cancelled - confirmation text did not match.', 'error');
    }
}
