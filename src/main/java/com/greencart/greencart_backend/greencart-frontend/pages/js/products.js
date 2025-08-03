// Products JavaScript for GreenCart (API version)

let allProducts = [];
let filteredProducts = [];
let currentFilters = {
    category: '',
    priceRange: '',
    search: '',
    sort: 'name'
};

document.addEventListener('DOMContentLoaded', function () {
    initializeProducts();
});

function initializeProducts() {
    fetch('http://localhost:8081/api/products')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            filteredProducts = [...allProducts];

            initializeFiltersFromURL();
            setupProductEventListeners();
            displayProducts();

            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                loadFeaturedProducts();
            }
        })
        .catch(error => {
            console.error('Error loading products:', error);
            allProducts = [];
            filteredProducts = [];
            displayProducts();
        });
}

function initializeFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    currentFilters.category = urlParams.get('category') || '';
    currentFilters.search = urlParams.get('search') || '';

    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');

    if (categoryFilter && currentFilters.category) {
        categoryFilter.value = currentFilters.category;
    }

    if (searchInput && currentFilters.search) {
        searchInput.value = currentFilters.search;
    }
}

function setupProductEventListeners() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function () {
            currentFilters.category = this.value;
            applyFilters();
        });
    }

    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', function () {
            currentFilters.priceRange = this.value;
            applyFilters();
        });
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function () {
            currentFilters.sort = this.value;
            applyFilters();
        });
    }

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentFilters.search = searchInput.value.trim();
        applyFilters();
    }
}

function applyFilters() {
    filteredProducts = [...allProducts];

    if (currentFilters.category) {
        filteredProducts = filteredProducts.filter(product =>
            product.category === currentFilters.category
        );
    }

    if (currentFilters.priceRange) {
        filteredProducts = filteredProducts.filter(product => {
            const price = product.price;
            switch (currentFilters.priceRange) {
                case '0-50': return price <= 50;
                case '50-100': return price > 50 && price <= 100;
                case '100-500': return price > 100 && price <= 500;
                case '500+': return price > 500;
                default: return true;
            }
        });
    }

    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    sortProducts();
    displayProducts();
}

function sortProducts() {
    switch (currentFilters.sort) {
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            break;
    }
}

function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productCount = document.getElementById('productCount');

    if (!productsGrid) return;

    if (productCount) {
        productCount.textContent = `${filteredProducts.length} products found`;
    }

    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => viewProductDetail(product.id);

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; align-items: center; justify-content: center; height: 100%; font-size: 3rem; color: #dee2e6;">
                <i class="fas fa-image"></i>
            </div>
            ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">
                <div class="stars">${GreenCart.generateStars(product.rating || 0)}</div>
                <span>(${product.reviews || 0})</span>
            </div>
            <div class="product-price">
                <span class="current-price">${GreenCart.formatPrice(product.price)}</span>
                ${product.originalPrice && product.originalPrice > product.price
                    ? `<span class="original-price">${GreenCart.formatPrice(product.originalPrice)}</span>`
                    : ''}
            </div>
            <button class="add-to-cart" onclick="event.stopPropagation(); GreenCart.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;

    return card;
}

function loadFeaturedProducts() {
    const featuredProducts = document.getElementById('featuredProducts');
    if (!featuredProducts) return;

    const featured = allProducts
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

    featuredProducts.innerHTML = '';
    featured.forEach(product => {
        const productCard = createProductCard(product);
        featuredProducts.appendChild(productCard);
    });
}

function viewProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Export for detail page
window.ProductsModule = {
    allProducts,
    getProductById: (id) => allProducts.find(p => p.id === parseInt(id))
};
