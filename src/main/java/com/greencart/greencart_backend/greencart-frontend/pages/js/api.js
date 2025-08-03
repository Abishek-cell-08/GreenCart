// API Configuration
const API_BASE_URL = 'http://localhost:8081/api';

// API Utility Functions
class ApiService {

    // Get auth token from localStorage
    static getAuthToken() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return user.token || null;
    }

    // ✅ Get public headers (no auth)
    static getPublicHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }

    // ✅ Get auth headers
    static getAuthHeaders() {
        const token = this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    // ✅ General request method, with auth optional
    static async request(endpoint, options = {}, useAuth = false) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: useAuth ? this.getAuthHeaders() : this.getPublicHeaders()
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Product APIs (✅ public access, so auth = false)
    static async getProducts(page = 0, size = 12, sort = 'name') {
        return this.request(`/products?page=${page}&size=${size}&sort=${sort}`, {}, false);
    }

    static async getProduct(id) {
        return this.request(`/products/${id}`, {}, false);
    }

    static async searchProducts(query, page = 0, size = 12) {
        return this.request(`/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {}, false);
    }

    static async getProductsByCategory(category, page = 0, size = 12) {
        return this.request(`/products/category/${encodeURIComponent(category)}?page=${page}&size=${size}`, {}, false);
    }

    static async getFeaturedProducts(limit = 8) {
        return this.request(`/products/featured?limit=${limit}`, {}, false);
    }

    static async getCategories() {
        return this.request('/products/categories', {}, false);
    }

    // Authentication APIs (✅ require auth)
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }, false);
    }

    static async signup(userData) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        }, false);
    }

    static async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        }, true);
    }

    // Cart APIs (✅ require auth)
    static async getCartItems(userId) {
        return this.request(`/cart/${userId}`, {}, true);
    }

    static async addToCart(cartItem) {
        return this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify(cartItem)
        }, true);
    }

    static async updateCartItem(cartItemId, quantity) {
        return this.request(`/cart/update/${cartItemId}?quantity=${quantity}`, {
            method: 'PUT'
        }, true);
    }

    static async removeFromCart(cartItemId) {
        return this.request(`/cart/remove/${cartItemId}`, {
            method: 'DELETE'
        }, true);
    }

    static async clearCart(userId) {
        return this.request(`/cart/clear/${userId}`, {
            method: 'DELETE'
        }, true);
    }

    static async getCartItemCount(userId) {
        return this.request(`/cart/count/${userId}`, {}, true);
    }
}

// Export for use in other files
window.ApiService = ApiService;
