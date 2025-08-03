# 🌱 GreenCart - Organic E-Commerce Platform

A modern, responsive organic e-commerce platform with a complete frontend and Spring Boot backend integration, featuring user authentication, organic product browsing, shopping cart, and sustainable order management.

## Features

### 🔐 User Authentication
- User registration and login
- Session management with localStorage
- Password validation and security

### 🌿 Organic Product Catalog
- Organic product browsing with search and filters
- Category-based filtering (Fruits, Vegetables, Grains, Dairy, etc.)
- Price range filtering
- Product sorting (name, price, rating, organic certification)
- Detailed product pages with organic specifications and customer reviews

### 🛒 Shopping Cart
- Add/remove items from cart
- Quantity management
- Size selection for applicable products
- Cart persistence across sessions
- Real-time cart updates

### 📦 Order Management
- Secure checkout process
- Multiple payment methods (Card, PayPal, COD)
- Order confirmation and tracking
- Order history in user profile

### 👤 User Profile
- Personal information management
- Order history
- Address management
- Wishlist functionality
- Notification preferences

### 📱 Responsive Design
- Mobile-first approach
- Modern and clean UI
- Smooth animations and transitions
- Cross-browser compatibility

### 🛡️ Admin Panel
- Comprehensive dashboard with organic sales statistics
- Organic product management (Add/Edit/Delete)
- Category management for organic products
- Order tracking and sustainable delivery updates
- User management and green analytics
- Review moderation
- Real-time activity monitoring
- Secure admin authentication

## Project Structure

```
E-Commerce/
├── index.html              # Home page
├── login.html              # Login page
├── signup.html             # Registration page
├── products.html           # Product catalog
├── product-detail.html     # Individual product page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout process
├── profile.html            # User profile
├── order-confirmation.html # Order confirmation
├── admin-login.html        # Admin login page
├── admin-dashboard.html    # Admin panel
├── README.md               # Project documentation
├── ADMIN_GUIDE.md          # Admin panel guide
├── css/
│   ├── style.css          # Main stylesheet
│   └── admin.css          # Admin panel styles
└── js/
    ├── main.js            # Core functionality
    ├── auth.js            # Authentication logic
    ├── products.js        # Product management
    ├── product-detail.js  # Product detail functionality
    ├── cart.js            # Shopping cart logic
    ├── checkout.js        # Checkout process
    ├── profile.js         # User profile management
    ├── admin.js           # Admin panel functionality
    └── api.js             # API integration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (for development server)
- Java 17+ (for backend)
- MySQL (optional, H2 used by default)
- Modern web browser
- Passion for organic, sustainable living! 🌱

1. **Clone or download** the project files to your local machine
2. **Open** `index.html` in your web browser
3. **Start browsing** products or create an account to access full features

## Demo Accounts

For testing purposes, the following demo accounts are pre-created:

### Customer Accounts
- **Email:** john@example.com  
  **Password:** password123

- **Email:** jane@example.com  
  **Password:** password123

### Admin Account
- **URL:** [Admin Panel](http://localhost:8000/admin-login.html)
- **Email:** admin@shopease.com  
  **Password:** admin123

## Architecture

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons and visual elements

### Backend
- **Spring Boot 3.x** - Java framework for REST APIs
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **MySQL** - Primary database (H2 for testing)
- **JWT** - Token-based authentication
- **Maven** - Build and dependency management

## 🌟 Key Highlights

- **Organic-First Design**: Clean, earth-friendly UI with natural color palette
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Dynamic cart updates and live organic inventory
- **Secure Authentication**: JWT-based authentication with proper validation
- **Green Admin Dashboard**: Complete admin panel for managing organic products
- **Sustainable API**: RESTful backend optimized for organic product management

## Features in Detail

### Authentication System
- Secure user registration with validation
- Login/logout functionality
- Session persistence
- Password strength requirements

### Product Management
- Dynamic product loading
- Search functionality with real-time filtering
- Category and price-based filtering
- Product ratings and reviews
- Wishlist functionality

### Shopping Cart
- Add products with size/quantity selection
- Real-time cart updates
- Persistent cart across sessions
- Cart total calculations with tax and shipping

### Checkout Process
- Multi-step checkout form
- Address management
- Payment method selection
- Order summary and confirmation
- Order tracking integration

### User Profile
- Personal information management
- Order history with detailed views
- Address book management
- Wishlist management
- Notification preferences

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Backend Integration Status

✅ **Completed:**
- Spring Boot backend setup with REST APIs
- User authentication with JWT tokens
- Product catalog management
- Cart operations
- Database integration (MySQL/H2)
- Frontend-backend API integration with fallback

🔄 **In Progress:**
- Order management system
- Payment processing integration
- Image upload and management

📋 **Future Enhancements:**
- Email notifications
- Advanced search with filters
- Product recommendations
- Multi-language support
- Admin panel for product management
- Real-time notifications
- Inventory management

## Development Notes

- All data is stored in localStorage for demo purposes
- In production, replace localStorage with proper backend APIs
- Images use placeholder URLs - replace with actual product images
- Payment processing is simulated - integrate with real payment gateways

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available under the MIT License.
# GreenCart
