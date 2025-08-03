// Product Detail JavaScript for GreenCart

let currentProduct = null;
let selectedQuantity = 1;
let selectedSize = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeProductDetail();
});

function initializeProductDetail() {
    // Get product ID from URL
    const productId = getUrlParameter('id');
    
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }
    
    // Load product data
    loadProductDetail(parseInt(productId));
    
    // Setup event listeners
    setupProductDetailEventListeners();
}

function loadProductDetail(productId) {
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:8081/api/products', {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(products => {
        console.log('Fetched products:', products); // Debug log
        if (!products || products.length === 0) {
            document.body.innerHTML = '<h2>No products found in backend.</h2>';
            return;
        }
        // Try to match productId as string and number
        currentProduct = products.find(p => p.id == productId);
        if (!currentProduct) {
            console.warn('Product not found for ID:', productId, 'Available IDs:', products.map(p => p.id));
            showProductNotFound();
            return;
        }
        displayProductDetail();
        loadProductReviews();
    })
    .catch(error => {
        console.error('Error fetching products:', error);
        showProductNotFound();
    });
}

function displayProductDetail() {
    // Update page title
    document.title = `${currentProduct.name} - ShopEase`;
    
    // Update breadcrumb
    const breadcrumb = document.getElementById('productBreadcrumb');
    if (breadcrumb) {
        breadcrumb.textContent = currentProduct.name;
    }
    
    // Update main image
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = currentProduct.image;
        mainImage.alt = currentProduct.name;
    }
    
    // Update product title
    const title = document.getElementById('productTitle');
    if (title) {
        title.textContent = currentProduct.name;
    }
    
    // Update rating
    const stars = document.getElementById('productStars');
    const reviewCount = document.getElementById('reviewCount');
    if (stars) {
        stars.innerHTML = generateStars(currentProduct.rating);
    }
    if (reviewCount) {
        reviewCount.textContent = `(${currentProduct.reviews} reviews)`;
    }
    
    // Update price
    const currentPrice = document.getElementById('currentPrice');
    const originalPrice = document.getElementById('originalPrice');
    const discount = document.getElementById('discount');
    
    if (currentPrice) {
        currentPrice.textContent = formatPrice(currentProduct.price);
    }
    
    if (originalPrice && currentProduct.originalPrice > currentProduct.price) {
        originalPrice.textContent = formatPrice(currentProduct.originalPrice);
        originalPrice.style.display = 'inline';
        
        if (discount) {
            const discountPercent = Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100);
            discount.textContent = `${discountPercent}% off`;
            discount.style.display = 'inline';
        }
    } else {
        if (originalPrice) originalPrice.style.display = 'none';
        if (discount) discount.style.display = 'none';
    }
    
    // Update description
    const description = document.getElementById('productDescription');
    if (description) {
        description.textContent = currentProduct.description;
    }
    
    // Update size selector
    const sizeSelector = document.getElementById('sizeSelector');
    const sizeSelect = document.getElementById('size');
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        if (sizeSelector) sizeSelector.classList.remove('hidden');
        if (sizeSelect) {
            sizeSelect.innerHTML = '';
            currentProduct.sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                sizeSelect.appendChild(option);
            });
            selectedSize = currentProduct.sizes[0];
        }
    } else {
        if (sizeSelector) sizeSelector.classList.add('hidden');
    }
    
    // Update specifications
    displaySpecifications();
    
    // Update wishlist button
    updateWishlistButton();
}

function displaySpecifications() {
    const specsContainer = document.getElementById('productSpecs');
    if (!specsContainer || !currentProduct.specifications) return;
    
    specsContainer.innerHTML = '';
    
    for (const [key, value] of Object.entries(currentProduct.specifications)) {
        const specRow = document.createElement('div');
        specRow.className = 'spec-row';
        specRow.innerHTML = `
            <span class="spec-label">${key}:</span>
            <span class="spec-value">${value}</span>
        `;
        specsContainer.appendChild(specRow);
    }
}

function setupProductDetailEventListeners() {
    // Quantity controls
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantity');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            if (selectedQuantity > 1) {
                selectedQuantity--;
                if (quantityInput) quantityInput.value = selectedQuantity;
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            selectedQuantity++;
            if (quantityInput) quantityInput.value = selectedQuantity;
        });
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value > 0) {
                selectedQuantity = value;
            } else {
                selectedQuantity = 1;
                e.target.value = 1;
            }
        });
    }
    
    // Size selector
    const sizeSelect = document.getElementById('size');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', (e) => {
            selectedSize = e.target.value;
        });
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCart);
    }
    
    // Buy now button
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', buyNow);
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', toggleWishlist);
    }
}

function addToCart() {
    if (!currentProduct) return;
    
    if (window.ShopEase && window.ShopEase.addToCart) {
        window.ShopEase.addToCart(currentProduct, selectedQuantity, selectedSize);
    } else {
        console.log('Adding to cart:', currentProduct.name, 'Quantity:', selectedQuantity, 'Size:', selectedSize);
    }
}

function buyNow() {
    if (!currentProduct) return;
    
    // Add to cart first
    addToCart();
    
    // Redirect to checkout
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 500);
}

function toggleWishlist() {
    if (!currentProduct) return;
    
    if (window.ShopEase) {
        if (window.ShopEase.isInWishlist(currentProduct.id)) {
            window.ShopEase.removeFromWishlist(currentProduct.id);
        } else {
            window.ShopEase.addToWishlist(currentProduct);
        }
        updateWishlistButton();
    }
}

function updateWishlistButton() {
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (!wishlistBtn || !currentProduct) return;
    
    const icon = wishlistBtn.querySelector('i');
    if (window.ShopEase && window.ShopEase.isInWishlist(currentProduct.id)) {
        icon.className = 'fas fa-heart';
        wishlistBtn.style.color = '#dc3545';
    } else {
        icon.className = 'far fa-heart';
        wishlistBtn.style.color = '#666';
    }
}

function loadProductReviews() {
    // Sample reviews data (in a real app, this would come from an API)
    const sampleReviews = [
        {
            id: 1,
            userName: 'John D.',
            rating: 5,
            date: '2024-01-15',
            comment: 'Excellent product! Highly recommended.',
            verified: true
        },
        {
            id: 2,
            userName: 'Sarah M.',
            rating: 4,
            date: '2024-01-10',
            comment: 'Good quality, fast shipping. Very satisfied with my purchase.',
            verified: true
        },
        {
            id: 3,
            userName: 'Mike R.',
            rating: 5,
            date: '2024-01-08',
            comment: 'Perfect! Exactly what I was looking for.',
            verified: false
        }
    ];
    
    displayReviews(sampleReviews);
    updateReviewsSummary(sampleReviews);
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    reviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet. Be the first to review this product!</p>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        reviewElement.innerHTML = `
            <div class="review-header">
                <div class="review-user">
                    <strong>${review.userName}</strong>
                    ${review.verified ? '<span class="verified-badge">Verified Purchase</span>' : ''}
                </div>
                <div class="review-date">${formatDate(review.date)}</div>
            </div>
            <div class="review-rating">
                ${generateStars(review.rating)}
            </div>
            <div class="review-comment">
                ${review.comment}
            </div>
        `;
        reviewsList.appendChild(reviewElement);
    });
}

function updateReviewsSummary(reviews) {
    const avgRating = document.getElementById('avgRating');
    const avgStars = document.getElementById('avgStars');
    const totalReviews = document.getElementById('totalReviews');
    
    if (reviews.length === 0) {
        if (avgRating) avgRating.textContent = '0.0';
        if (avgStars) avgStars.innerHTML = generateStars(0);
        if (totalReviews) totalReviews.textContent = '0 reviews';
        return;
    }
    
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    if (avgRating) avgRating.textContent = average.toFixed(1);
    if (avgStars) avgStars.innerHTML = generateStars(average);
    if (totalReviews) totalReviews.textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
}

function showProductNotFound() {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center;">
            <h1>Product Not Found</h1>
            <p>The product you're looking for doesn't exist.</p>
            <button onclick="window.location.href='products.html'" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Back to Products
            </button>
        </div>
    `;
}

// Utility functions
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
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
