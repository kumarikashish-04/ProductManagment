# Aasamedchem - Chemical Products Inventory & Quotation System

A comprehensive full-stack e-commerce application for managing and ordering chemical products with advanced unit conversion, role-based access control, and quotation management.

## 🚀 Features

### Authentication & Authorization
- User registration and login with JWT
- Role-based access control (Admin, Seller)
- Secure password hashing with bcryptjs
- Token-based authentication with 7-day expiry

### Product Management
- Create, read, update, delete products
- Multiple unit support (g, kg, mL, L, items)
- Tax calculation per product
- Category classification
- SKU management
- High decimal precision pricing

### Unit Conversion System
- Automatic unit conversion for quantities
- Support for weight (g ↔ kg), volume (mL ↔ L), and count (items)
- Consistent storage in base units
- User-friendly display with appropriate units

### Quotation & Ordering
- Create quotations with flexible units
- Convert quotations to orders
- Calculate total prices with tax
- Order status tracking
- Customer and admin views

### Admin Dashboard
- Order overview and management
- Quotation tracking and approval
- Product inventory management
- Revenue statistics
- Order status updates

### Seller/User Interface
- Browse and search products
- Filter by category and price
- Add products to quotation cart
- Create quotations or direct orders
- View order history

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("admin" | "seller"),
  companyName: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  isActive: Boolean,
  timestamps: true
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  category: String,
  sku: String (unique),
  baseUnit: String ("g" | "kg" | "mL" | "L" | "item"),
  baseQuantity: Decimal128,
  basePricePerUnit: Decimal128 (INR),
  supportedUnits: Array of Strings,
  hsnCode: String,
  taxPercentage: Decimal128,
  minimumOrderQuantity: Decimal128,
  isActive: Boolean,
  createdBy: ObjectId (User),
  timestamps: true
}
```

### Order Model
```javascript
{
  user: ObjectId (User),
  quotationId: ObjectId (Quotation),
  items: [
    {
      product: ObjectId (Product),
      quantity: Decimal128,
      unit: String,
      pricePerUnit: Decimal128,
      subtotal: Decimal128,
      baseUnitQuantity: Decimal128
    }
  ],
  subtotalAmount: Decimal128 (INR),
  taxAmount: Decimal128 (INR),
  totalAmount: Decimal128 (INR),
  status: String ("quotation" | "confirmed" | "shipped" | "delivered" | "cancelled"),
  notes: String,
  deliveryDate: Date,
  sellerNotes: String,
  timestamps: true
}
```

### Quotation Model
```javascript
{
  user: ObjectId (User),
  items: [
    {
      product: ObjectId (Product),
      quantity: Decimal128,
      unit: String,
      pricePerUnit: Decimal128,
      subtotal: Decimal128
    }
  ],
  subtotalAmount: Decimal128 (INR),
  taxAmount: Decimal128 (INR),
  totalAmount: Decimal128 (INR),
  status: String ("pending" | "accepted" | "rejected" | "converted_to_order"),
  notes: String,
  adminNotes: String,
  validUntil: Date,
  orderId: ObjectId (Order),
  timestamps: true
}
```

## 💾 Unit Conversion & Storage Strategy

### Base Units
- **Weight**: grams (g) - smallest unit, 1 kg = 1000 g
- **Volume**: milliliters (mL) - smallest unit, 1 L = 1000 mL
- **Count**: items - unit count, no conversion needed

### Storage Strategy
1. **All quantities are stored in base units** in the database
2. **Conversions happen at API boundaries**:
   - Before saving: Convert user input to base units
   - After retrieval: Display in appropriate unit
3. **Price storage**: Always stored as price per base unit (₹/g, ₹/mL, or ₹/item)

### Conversion Factors
```javascript
const CONVERSION_FACTORS = {
  "g": 1,      // grams (base)
  "kg": 1000,  // kilograms
  "mL": 1,     // milliliters (base)
  "L": 1000,   // liters
  "item": 1    // items (base, no conversion)
};
```

### Calculation Examples
**Example 1**: Product with 5kg in stock at ₹50/kg
- Storage: `baseQuantity: 5000`, `basePricePerUnit: 50`
- When user orders 2.5 kg:
  - Quantity in base units: 2.5 × 1000 = 2500 g
  - Total price: 2500 × 50 / 1000 = ₹125

**Example 2**: Liquid product 10L at ₹100/L
- Storage: `baseQuantity: 10000`, `basePricePerUnit: 100`
- When user orders 500 mL:
  - Quantity in base units: 500 mL
  - Total price: 500 × 100 / 1000 = ₹50

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Mongoose ODM)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Decimal128** - High precision numbers

### Frontend
- **React 19** - UI library
- **React Router 7** - Navigation
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ and npm
- MongoDB database
- Git

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/aasamedchem
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

5. **Start the backend server**
```bash
npm start
```

Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Aasamedchem
```

5. **Start development server**
```bash
npm run dev
```

Application will run on http://localhost:5173

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Products
- `GET /api/products` - List all products (with filters)
- `GET /api/products/:id` - Get product details
- `GET /api/products/pricing/:id` - Get product with pricing
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Quotations
- `POST /api/quotations` - Create quotation (protected)
- `GET /api/quotations` - List quotations
- `GET /api/quotations/:id` - Get quotation details
- `PUT /api/quotations/:id/status` - Update quotation status (admin only)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders/stats` - Get order statistics (admin only)

## 🔐 Authentication Flow

1. **User Registration**
   - POST /auth/register with credentials
   - Password hashed with bcryptjs (10 salt rounds)
   - User created with role "seller" (or "admin" if specified)

2. **User Login**
   - POST /auth/login with email and password
   - Password verified against hash
   - JWT token generated (7-day expiry)
   - Token stored in localStorage

3. **Protected Requests**
   - Token sent in Authorization header: `Bearer <token>`
   - Middleware verifies token signature
   - User info attached to request object

## 🎨 UI Components

### Pages
- **Login** - User authentication
- **Register** - New user registration
- **Products** - Product listing with search and filters
- **Quotation** - Cart and quotation creation
- **Orders** - User's order history
- **Admin Dashboard** - Admin overview and management

### Features
- Responsive design (mobile, tablet, desktop)
- Real-time search and filtering
- Error handling and validation
- Loading states
- Success/error notifications

## 🌐 Deployment

### Deploy Backend to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd backend
vercel
```

4. **Configure environment variables on Vercel dashboard**
   - Add MONGO_URI (MongoDB Atlas connection string)
   - Add JWT_SECRET
   - Add CORS_ORIGIN

5. **Update API URL in frontend .env**
```
VITE_API_URL=https://your-backend.vercel.app/api
```

### Deploy Frontend to Vercel

1. **Deploy**
```bash
cd client
vercel
```

2. **Configure build settings**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 📚 Example API Usage

### Create Product (Admin)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sulfuric Acid 98%",
    "sku": "SA-98-001",
    "category": "Acids",
    "baseUnit": "mL",
    "baseQuantity": 1000000,
    "basePricePerUnit": 450.50,
    "supportedUnits": ["mL", "L"],
    "taxPercentage": 18,
    "description": "Industrial grade sulfuric acid"
  }'
```

### Create Quotation
```bash
curl -X POST http://localhost:5000/api/quotations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "507f1f77bcf86cd799439011",
        "quantity": 5,
        "unit": "kg"
      }
    ],
    "notes": "Bulk order for industrial use"
  }'
```

## 🧮 Numeric Field Handling

### Why Decimal128?
- **Precision**: Handles up to 34 significant digits
- **Range**: Can represent extremely large and small values
- **Financial**: Prevents floating-point rounding errors
- **Scale**: Suitable for currency and scientific measurements

### Field Types Explained
- **basePricePerUnit**: `Decimal128` - ₹/unit with high precision
- **baseQuantity**: `Decimal128` - Quantity in base units
- **taxPercentage**: `Decimal128` - Tax rate (0-28%)
- **minimumOrderQuantity**: `Decimal128` - MOQ

## 🔍 Search & Filtering

### Product Search
- By name (case-insensitive)
- By description
- By SKU

### Product Filtering
- By category
- By price (ascending/descending)
- Sort by latest, name, or price

## 📦 Project Structure

```
aasamedchem/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── quotationController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Quotation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── quotationRoutes.js
│   ├── utils/
│   │   ├── converter.js
│   │   └── unitConversion.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Products.jsx
    │   │   ├── Quotation.jsx
    │   │   ├── Orders.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── styles/
    │   │   ├── Auth.css
    │   │   ├── Products.css
    │   │   ├── Quotation.css
    │   │   ├── AdminDashboard.css
    │   │   └── Navbar.css
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── README.md
```

## 🧪 Testing Credentials

### Admin User
- Email: admin@aasamedchem.com
- Password: Admin@123

### Seller User
- Email: seller@aasamedchem.com
- Password: Seller@123

## 🔒 Security Measures

1. **Password Security**: bcryptjs with 10 salt rounds
2. **JWT Tokens**: Signed with secret key, 7-day expiry
3. **CORS**: Restricted to frontend origin
4. **Input Validation**: Server-side validation for all inputs
5. **Role-Based Access**: Protected endpoints with role checks
6. **Database Security**: MongoDB connection string in env

## 📊 Pricing Examples

### Example 1: Weight-Based Chemical
```
Product: Sodium Hydroxide (NaOH)
- Base Unit: g (grams)
- Base Price: ₹2.50/g
- In Stock: 1000 kg (1,000,000 g)

Orders:
- 500g @ ₹2.50/g = ₹1,250
- 1 kg @ ₹2.50/g = ₹2,500
- 5 kg @ ₹2.50/g = ₹12,500
```

### Example 2: Volume-Based Chemical
```
Product: Sulfuric Acid 98%
- Base Unit: mL (milliliters)
- Base Price: ₹45/mL
- In Stock: 10,000 L (10,000,000 mL)

Orders:
- 500 mL @ ₹45/mL = ₹22,500
- 1 L @ ₹45/mL = ₹45,000
- 10 L @ ₹45/mL = ₹450,000
```

### Example 3: Item-Based Product
```
Product: Test Tubes (100ml)
- Base Unit: item
- Base Price: ₹15/item
- In Stock: 50,000 items

Orders:
- 10 items @ ₹15 = ₹150
- 100 items @ ₹15 = ₹1,500
- 1000 items @ ₹15 = ₹15,000
```

## 🚨 Error Handling

- Validation errors: 400 Bad Request
- Authentication errors: 401 Unauthorized
- Authorization errors: 403 Forbidden
- Not found errors: 404 Not Found
- Server errors: 500 Internal Server Error

## 🔄 Workflow

### Customer Workflow
1. Register or Login
2. Browse products
3. Search/filter by category or price
4. Add products to quotation cart
5. Review items and select units
6. Create quotation for review
7. Or directly place order
8. View order status

### Admin Workflow
1. Login with admin account
2. View dashboard with stats
3. Review incoming quotations
4. Approve/reject quotations
5. Manage orders (update status)
6. Track shipments and deliveries
7. Create/update/delete products
8. Monitor inventory levels

## 📞 Support

For issues or questions, please contact: support@aasamedchem.com

## 📄 License

This project is licensed under the ISC License.

---

**Version**: 1.0.0  
**Last Updated**: June 2026
