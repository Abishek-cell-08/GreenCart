// Admin Panel JavaScript for GreenCart

let currentAdmin = null;
let currentEditingProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Check if admin is logged in
    const adminData = localStorage.getItem('adminUser');
    if (!adminData) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    currentAdmin = JSON.parse(adminData);
    
    // Update admin name in header
    const adminUserName = document.getElementById('adminUserName');
    if (adminUserName) {
        adminUserName.textContent = currentAdmin.name;
    }
    
    // Setup event listeners
    setupAdminEventListeners();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load initial section
    showSection('dashboard');
}

function setupAdminEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // User dropdown
    const adminUserBtn = document.getElementById('adminUserBtn');
    const adminDropdownMenu = document.getElementById('adminDropdownMenu');
    
    if (adminUserBtn) {
        adminUserBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            adminDropdownMenu.classList.toggle('show');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (adminDropdownMenu) {
            adminDropdownMenu.classList.remove('show');
        }
    });
    
    // Logout
    const adminLogout = document.getElementById('adminLogout');
    if (adminLogout) {
        adminLogout.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('adminUser');
                window.location.href = 'admin-login.html';
            }
        });
    }
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Filters
    const productCategoryFilter = document.getElementById('productCategoryFilter');
    const productStatusFilter = document.getElementById('productStatusFilter');
    const productSearchInput = document.getElementById('productSearchInput');
    
    if (productCategoryFilter) {
        productCategoryFilter.addEventListener('change', filterProducts);
    }
    if (productStatusFilter) {
        productStatusFilter.addEventListener('change', filterProducts);
    }
    if (productSearchInput) {
        productSearchInput.addEventListener('input', filterProducts);
    }
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Load section-specific data
    switch (sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProductsData();
            break;
        case 'categories':
            loadCategoriesData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'reviews':
            loadReviewsData();
            break;
    }
}

function loadDashboardData() {
    // Load stats
    const products = window.ProductsModule ? window.ProductsModule.allProducts : [];
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Update stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalOrders').textContent = orders.length;
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    
    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    if (!recentActivity) return;
    
    // Sample activity data
    const activities = [
        {
            icon: 'fas fa-user-plus',
            title: 'New user registered',
            description: 'john.doe@example.com joined ShopEase',
            time: '2 hours ago'
        },
        {
            icon: 'fas fa-shopping-cart',
            title: 'New order placed',
            description: 'Order #1001 for $79.99',
            time: '4 hours ago'
        },
        {
            icon: 'fas fa-star',
            title: 'New product review',
            description: '5-star review for Wireless Headphones',
            time: '6 hours ago'
        },
        {
            icon: 'fas fa-box',
            title: 'Product updated',
            description: 'Premium Cotton T-Shirt stock updated',
            time: '1 day ago'
        }
    ];
    
    recentActivity.innerHTML = '';
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description} • ${activity.time}</p>
            </div>
        `;
        recentActivity.appendChild(activityItem);
    });
}

function loadProductsData() {
    const products = window.ProductsModule ? window.ProductsModule.allProducts : [];
    displayProducts(products);
}

function displayProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
            </td>
            <td>
                <strong>${product.name}</strong>
            </td>
            <td>
                <span class="status-badge status-${product.category}">${product.category}</span>
            </td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.inStock ? 'In Stock' : 'Out of Stock'}</td>
            <td>
                <span class="status-badge ${product.inStock ? 'status-active' : 'status-inactive'}">
                    ${product.inStock ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="admin-btn admin-btn-sm admin-btn-primary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterProducts() {
    const categoryFilter = document.getElementById('productCategoryFilter').value;
    const statusFilter = document.getElementById('productStatusFilter').value;
    const searchTerm = document.getElementById('productSearchInput').value.toLowerCase();
    
    let products = window.ProductsModule ? window.ProductsModule.allProducts : [];
    
    // Apply filters
    if (categoryFilter) {
        products = products.filter(p => p.category === categoryFilter);
    }
    
    if (statusFilter) {
        if (statusFilter === 'active') {
            products = products.filter(p => p.inStock);
        } else if (statusFilter === 'inactive') {
            products = products.filter(p => !p.inStock);
        }
    }
    
    if (searchTerm) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    displayProducts(products);
}

function showAddProductModal() {
    currentEditingProduct = null;
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
}

function editProduct(productId) {
    const products = window.ProductsModule ? window.ProductsModule.allProducts : [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    currentEditingProduct = product;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    
    // Fill form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productStock').value = product.stock || 100;
    document.getElementById('productStatus').value = product.inStock ? 'active' : 'inactive';
    
    document.getElementById('productModal').style.display = 'block';
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    // In a real app, this would make an API call
    const products = window.ProductsModule ? window.ProductsModule.allProducts : [];
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products.splice(index, 1);
        loadProductsData();
        showAdminMessage('Product deleted successfully!', 'success');
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        originalPrice: parseFloat(formData.get('originalPrice')) || null,
        description: formData.get('description'),
        image: formData.get('image'),
        stock: parseInt(formData.get('stock')),
        inStock: formData.get('status') === 'active',
        rating: 4.0,
        reviews: 0,
        specifications: {}
    };
    
    if (currentEditingProduct) {
        // Update existing product
        Object.assign(currentEditingProduct, productData);
        showAdminMessage('Product updated successfully!', 'success');
    } else {
        // Add new product
        const products = window.ProductsModule ? window.ProductsModule.allProducts : [];
        productData.id = Math.max(...products.map(p => p.id), 0) + 1;
        products.push(productData);
        showAdminMessage('Product added successfully!', 'success');
    }
    
    closeProductModal();
    loadProductsData();
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentEditingProduct = null;
}

function loadCategoriesData() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    const categories = [
        { name: 'Electronics', description: 'Electronic devices and gadgets', count: 5, status: 'active' },
        { name: 'Clothing', description: 'Fashion and apparel', count: 3, status: 'active' },
        { name: 'Books', description: 'Books and educational materials', count: 2, status: 'active' },
        { name: 'Home & Garden', description: 'Home improvement and garden supplies', count: 1, status: 'active' }
    ];
    
    tbody.innerHTML = '';
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${category.name}</strong></td>
            <td>${category.description}</td>
            <td>${category.count}</td>
            <td>
                <span class="status-badge status-${category.status}">${category.status}</span>
            </td>
            <td>
                <button class="admin-btn admin-btn-sm admin-btn-primary">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-danger">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadOrdersData() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    // Sample orders data
    const orders = [
        { id: '1001', customer: 'John Doe', date: '2024-01-15', total: 79.99, status: 'delivered' },
        { id: '1002', customer: 'Jane Smith', date: '2024-01-14', total: 24.99, status: 'shipped' },
        { id: '1003', customer: 'Mike Johnson', date: '2024-01-13', total: 39.99, status: 'processing' },
        { id: '1004', customer: 'Sarah Wilson', date: '2024-01-12', total: 159.98, status: 'pending' }
    ];
    
    tbody.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${formatDate(order.date)}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </td>
            <td>
                <button class="admin-btn admin-btn-sm admin-btn-primary">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-success">
                    <i class="fas fa-edit"></i> Update
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadUsersData() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    tbody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${user.firstName} ${user.lastName}</strong></td>
            <td>${user.email}</td>
            <td>${formatDate(user.createdAt || '2024-01-01')}</td>
            <td>0</td>
            <td>
                <span class="status-badge status-active">Active</span>
            </td>
            <td>
                <button class="admin-btn admin-btn-sm admin-btn-primary">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-danger">
                    <i class="fas fa-ban"></i> Suspend
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadReviewsData() {
    const tbody = document.getElementById('reviewsTableBody');
    if (!tbody) return;
    
    // Sample reviews data
    const reviews = [
        { product: 'Wireless Headphones', customer: 'John D.', rating: 5, review: 'Excellent product!', date: '2024-01-15', status: 'approved' },
        { product: 'Cotton T-Shirt', customer: 'Sarah M.', rating: 4, review: 'Good quality, fast shipping.', date: '2024-01-10', status: 'approved' },
        { product: 'JavaScript Book', customer: 'Mike R.', rating: 5, review: 'Perfect for learning!', date: '2024-01-08', status: 'pending' }
    ];
    
    tbody.innerHTML = '';
    reviews.forEach(review => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${review.product}</strong></td>
            <td>${review.customer}</td>
            <td>
                <div class="rating">
                    ${generateStars(review.rating)}
                </div>
            </td>
            <td>${review.review}</td>
            <td>${formatDate(review.date)}</td>
            <td>
                <span class="status-badge status-${review.status === 'approved' ? 'active' : 'pending'}">${review.status}</span>
            </td>
            <td>
                <button class="admin-btn admin-btn-sm admin-btn-success">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="admin-btn admin-btn-sm admin-btn-danger">
                    <i class="fas fa-times"></i> Reject
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAdminMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `admin-message message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1002;
        max-width: 300px;
    `;
    
    // Style based on type
    if (type === 'success') {
        messageEl.style.background = '#d4edda';
        messageEl.style.color = '#155724';
        messageEl.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        messageEl.style.background = '#f8d7da';
        messageEl.style.color = '#721c24';
        messageEl.style.border = '1px solid #f5c6cb';
    }
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Utility functions
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star" style="color: #ffc107;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #ffc107;"></i>';
        }
    }
    return stars;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
};
