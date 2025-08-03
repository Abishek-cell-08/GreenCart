// Main JavaScript file for GreenCart Organic E-commerce Website

// Global variables
let currentUser = null;
let cart = [];
let wishlist = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();

    // If we're on the homepage, show featured products
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        fetchProductsAndDisplay();
    }
});

function initializeApp() {
    loadUserData();
    updateNavigation();
    loadCartData();
    initializeEventListeners();
    updateCartCount();
}

// Fetch and display products on homepage
function fetchProductsAndDisplay() {
    // Get token from localStorage if available
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:8081/api/products', {
        method: 'GET',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            const productsGrid = document.getElementById('featuredProducts');
            if (productsGrid) {
                productsGrid.innerHTML = '<div class="error-message">Unable to load products. Please login or try again later.</div>';
            }
        });
}

function displayProducts(products) {
    const productsGrid = document.getElementById('featuredProducts');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<div class="no-products-message">No featured products available.</div>';
        return;
    }

    const featured = products.slice(0, 4); // Show first 4

    featured.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const discount =
            product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}" />
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    ${generateStars(product.rating || 4)} <span>(${product.reviews || 0})</span>
                </div>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${
                        product.originalPrice && product.originalPrice > product.price
                            ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>`
                            : ''
                    }
                </div>
                <button onclick='GreenCart.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})'>
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;

        productsGrid.appendChild(card);
    });
}

function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

function loadCartData() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
        cart = JSON.parse(cartData);
    }

    const wishlistData = localStorage.getItem('wishlist');
    if (wishlistData) {
        wishlist = JSON.parse(wishlistData);
    }
}

function saveCartData() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveWishlistData() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateNavigation() {
    const authLink = document.getElementById('authLink');
    const profileLink = document.getElementById('profileLink');
    const cartLink = document.getElementById('cartLink');

    if (currentUser) {
        if (authLink) authLink.textContent = 'Logout';
        if (profileLink) {
            profileLink.textContent = 'Profile';
            profileLink.href = 'profile.html';
            profileLink.style.display = 'inline';
        }
    } else {
        if (authLink) authLink.textContent = 'Login';
        if (profileLink) {
            profileLink.style.display = 'none';
        }
    }

    if (cartLink) {
        cartLink.href = 'cart.html';
    }
}

function initializeEventListeners() {
    const authLink = document.getElementById('authLink');
    if (authLink) {
        authLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentUser) {
                logout();
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentUser) {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    wishlist = [];
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    updateNavigation();
    updateCartCount();
    window.location.href = 'index.html';
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Cart functions
function addToCart(product, quantity = 1, size = null) {
    if (!currentUser) {
        showMessage('Please login to add items to cart', 'error');
        window.location.href = 'login.html';
        return;
    }

    const existingItem = cart.find(item => item.id === product.id && item.size === size);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl,
            quantity: quantity,
            size: size
        });
    }

    saveCartData();
    updateCartCount();
    showMessage('Item added to cart successfully!', 'success');
}

function removeFromCart(productId, size = null) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCartData();
    updateCartCount();
}

function updateCartItemQuantity(productId, size, newQuantity) {
    const item = cart.find(item => item.id === productId && item.size === size);

    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId, size);
        } else {
            item.quantity = newQuantity;
            saveCartData();
            updateCartCount();
        }
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Wishlist functions
function addToWishlist(product) {
    if (!currentUser) {
        showMessage('Please login to add items to wishlist', 'error');
        window.location.href = 'login.html';
        return;
    }

    const existingItem = wishlist.find(item => item.id === product.id);

    if (!existingItem) {
        wishlist.push(product);
        saveWishlistData();
        showMessage('Item added to wishlist!', 'success');
    } else {
        showMessage('Item already in wishlist', 'info');
    }
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlistData();
}

function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
}

// Utility functions
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(messageEl, container.firstChild);

    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

function formatPrice(price) {
    return `₹${price.toFixed(2)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        } else {
            stars += '<i class="far fa-star star"></i>';
        }
    }
    return stars;
}

function filterByCategory(category) {
    window.location.href = `products.html?category=${category}`;
}

function searchProducts(query) {
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';

    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;

        element.style.opacity = Math.min(progress / duration, 1);

        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;

        element.style.opacity = Math.max(1 - progress / duration, 0);

        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }

    requestAnimationFrame(animate);
}

// Export functions for use in other files
window.GreenCart = {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    showMessage,
    formatPrice,
    formatDate,
    generateStars,
    filterByCategory,
    searchProducts,
    getUrlParameter,
    saveToLocalStorage,
    getFromLocalStorage,
    fadeIn,
    fadeOut,
    currentUser,
    cart,
    wishlist
};
