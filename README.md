# Scatch E-Commerce Backend API

A backend-focused e-commerce REST API built using Node.js, Express.js, MongoDB, and Mongoose.

This project started as a guided backend learning project and was later improved into an API-first application tested through Postman. It includes user authentication, separate owner authentication, role-based product creation, image uploads, cart quantity management, bill calculation, protected routes, and logout functionality.

The main purpose of this repository is both to demonstrate my backend development skills and to serve as a revision reference for the complete request-response flow of a Node.js backend.

---

## Features

### User Features

- User registration
- Password hashing using bcrypt
- User login
- JWT-based authentication
- JWT stored in an HTTP-only cookie
- Protected routes
- Add products to cart
- Increase quantity when the same product is added again
- View populated cart data
- Automatic bill calculation
- User logout

### Owner Features

- Separate owner login
- Separate owner JWT authentication
- Owner-only product creation
- Product image upload using Multer
- Owner logout

### Security Features

- Password hashing with bcrypt
- JWT expiration
- HTTP-only cookies
- SameSite cookie protection
- Separate user and owner tokens
- Protected routes using middleware
- Duplicate email prevention
- Owner-only authorization

---

# Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| bcrypt | Password hashing |
| jsonwebtoken | JWT authentication |
| cookie-parser | Reading cookies |
| Multer | Image upload handling |
| dotenv | Environment variables |
| Postman | API testing |
| Nodemon | Development server restart |

---

# Project Architecture

```text
E-commerce_Bags/
│
├── config/
│   ├── mongoose-connection.js
│   └── multer-config.js
│
├── controllers/
│   └── authController.js
│
├── middlewares/
│   ├── isLoggedin.js
│   └── isOwner.js
│
├── models/
│   ├── user-model.js
│   ├── owners-model.js
│   └── product-model.js
│
├── routes/
│   ├── index.js
│   ├── usersRouter.js
│   ├── ownersRouter.js
│   └── productsRouter.js
│
├── utils/
│   └── generateToken.js
│
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

---

# How the Backend Works

Before revising individual features, remember the general Express flow:

```text
Client / Postman
      ↓
HTTP Request
      ↓
app.js
      ↓
Matching Router
      ↓
Middleware (if any)
      ↓
Controller / Route Handler
      ↓
Mongoose Model
      ↓
MongoDB
      ↓
JSON Response
      ↓
Client / Postman
```

Example:

```text
POST /users/login
        ↓
app.js
        ↓
/users → usersRouter
        ↓
loginUser controller
        ↓
Find user in MongoDB
        ↓
Compare password with bcrypt
        ↓
Generate JWT
        ↓
Store JWT in cookie
        ↓
Send JSON response
```

---

# Application Entry Point

The main file is:

```text
app.js
```

Its main responsibilities are:

1. Create the Express application.
2. Configure middleware.
3. Connect routers.
4. Start the server.

Typical middleware flow:

```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
```

### `express.json()`

Reads incoming JSON request bodies.

Example:

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

The data becomes available through:

```js
req.body
```

### `express.urlencoded()`

Reads form data.

### `cookieParser()`

Reads cookies sent by the client.

The token becomes available through:

```js
req.cookies.token
```

---

# Route Mounting

Routers are mounted in `app.js`.

Conceptually:

```js
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/owners", ownersRouter);
app.use("/products", productsRouter);
```

This means:

```text
Router route          Mounted path       Final URL

/login                /users             /users/login
/logout               /users             /users/logout
/login                /owners            /owners/login
/create               /products          /products/create
/shop                 /                   /shop
/cart                 /                   /cart
```

Important revision concept:

> The final API URL is the combination of the path in `app.use()` and the path inside the router.

---

# Database Connection Flow

MongoDB connection is handled separately in:

```text
config/mongoose-connection.js
```

Flow:

```text
app.js starts
    ↓
mongoose-connection.js loads
    ↓
Mongoose connects to MongoDB
    ↓
Models can communicate with database collections
```

Example connection:

```js
mongoose.connect(process.env.MONGODB_URI);
```

Environment variables are used so database credentials and secrets are not hardcoded.

---

# Models and Schemas

Mongoose schemas define the structure of data stored in MongoDB.

---

## User Model

The user contains:

```text
fullname
email
password
cart
```

The cart uses a nested structure:

```js
cart: [
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        quantity: {
            type: Number,
            default: 1
        }
    }
]
```

Example stored cart:

```json
{
    "cart": [
        {
            "product": "PRODUCT_OBJECT_ID",
            "quantity": 2
        }
    ]
}
```

Why not store the complete product inside the user?

Because that would duplicate product data.

Instead:

```text
User Cart
   ↓
stores Product ObjectId
   ↓
ObjectId references Product collection
   ↓
populate() fetches complete product
```

---

## Product Model

A product contains data such as:

```text
image
name
price
discount
bgcolor
panelcolor
textcolor
```

The image is stored as:

```js
image: Buffer
```

Why?

Multer reads the uploaded image into memory:

```js
req.file.buffer
```

That binary data is then stored in MongoDB.

For the `/shop` API, images are excluded:

```js
productModel.find().select("-image");
```

This prevents huge binary image buffers from making the JSON response too large.

---

## Owner Model

The owner is separate from a normal user.

It contains data such as:

```text
fullname
email
password
products
picture
gstin
```

The important design decision is:

```text
Normal User
    ↓
Can browse and use cart

Owner
    ↓
Can create products
```

This is authorization.

---

# Authentication vs Authorization

These are different concepts.

## Authentication

Authentication asks:

> Who are you?

Example:

```text
User logs in
    ↓
Email and password verified
    ↓
JWT generated
    ↓
User is authenticated
```

## Authorization

Authorization asks:

> What are you allowed to do?

Example:

```text
Normal user
    ↓
Authenticated
    ↓
Still cannot create products

Owner
    ↓
Authenticated as owner
    ↓
Allowed to create products
```

In this project:

```text
isLoggedin → User authentication

isOwner → Owner authentication + authorization
```

---

# User Registration Flow

Endpoint:

```text
POST /users/register
```

Request:

```json
{
    "fullname": "Peter Parker",
    "email": "peter@example.com",
    "password": "spiderman123"
}
```

Complete flow:

```text
POST /users/register
        ↓
usersRouter
        ↓
registerUser controller
        ↓
Read req.body
        ↓
Check whether email already exists
        ↓
bcrypt.hash(password, 10)
        ↓
Store hashed password in MongoDB
        ↓
Generate JWT
        ↓
Store JWT in token cookie
        ↓
Return 201 Created
```

Important:

Never store this:

```text
password123
```

Store:

```text
$2b$10$...
```

The password is hashed using:

```js
bcrypt.hash(password, 10);
```

The number `10` is the salt rounds.

---

# Duplicate Email Handling

Before creating a user:

```js
const existingUser = await userModel.findOne({ email });
```

If the email already exists:

```text
409 Conflict
```

Why not `401`?

```text
401 → Authentication failed
409 → Resource conflicts with existing data
```

---

# Login Flow

Endpoint:

```text
POST /users/login
```

Request:

```json
{
    "email": "peter@example.com",
    "password": "spiderman123"
}
```

Flow:

```text
Login request
    ↓
Find user using email
    ↓
User exists?
    ↓ No
Return 401
    ↓ Yes
Compare entered password with stored hash
    ↓
bcrypt.compare()
    ↓
Password correct?
    ↓ No
Return 401
    ↓ Yes
Generate JWT
    ↓
Store JWT in cookie
    ↓
Return 200 OK
```

Password comparison:

```js
bcrypt.compare(password, user.password);
```

We never decrypt the stored password.

bcrypt compares:

```text
Plain password entered by user

against

Stored password hash
```

---

# JWT Authentication

After successful registration or login, the server creates a JWT.

Payload contains information such as:

```js
{
    id: user._id,
    email: user.email
}
```

Token generation:

```js
jwt.sign(
    payload,
    process.env.JWT_KEY,
    {
        expiresIn: "7d"
    }
);
```

The token has three conceptual parts:

```text
HEADER.PAYLOAD.SIGNATURE
```

The signature proves that the token was created using the server's secret key.

---

# Cookie Authentication

The JWT is stored inside a cookie:

```js
res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### `httpOnly`

Frontend JavaScript cannot directly access the cookie.

This helps reduce token theft through certain XSS attacks.

### `sameSite: "lax"`

Provides protection against many cross-site request attacks.

### `maxAge`

Controls how long the cookie exists.

---

# Protected Route Flow

Example protected route:

```text
GET /shop
```

Flow:

```text
Request to /shop
    ↓
isLoggedin middleware runs first
    ↓
Read token from cookie
    ↓
Token exists?
    ↓ No
Return 401
    ↓ Yes
Verify JWT
    ↓
Find user in database
    ↓
Attach user to req.user
    ↓
Call next()
    ↓
/shop route handler runs
```

The important middleware concept:

```js
next();
```

means:

> This middleware has completed successfully. Continue to the next middleware or route handler.

---

# `req.user`

After authentication middleware succeeds:

```js
req.user = user;
```

Now later routes can access:

```js
req.user.email
req.user._id
```

This avoids asking the client to send user identity again.

The identity comes from the verified token.

---

# Shop Flow

Endpoint:

```text
GET /shop
```

Protected by:

```text
isLoggedin
```

Flow:

```text
GET /shop
    ↓
Verify user token
    ↓
Fetch products from MongoDB
    ↓
Exclude raw image buffer
    ↓
Return products as JSON
```

Products are fetched using:

```js
productModel.find().select("-image");
```

The `-image` means:

> Return every field except image.

---

# Multer Image Upload Flow

Product creation uses:

```text
multipart/form-data
```

instead of raw JSON.

Why?

Because the request contains:

```text
Text data + File data
```

Postman example:

```text
image        File
name         Text
price        Text
discount     Text
bgcolor      Text
panelcolor   Text
textcolor    Text
```

The route uses:

```js
upload.single("image");
```

The word `"image"` must exactly match the form-data key.

Flow:

```text
Postman uploads image
    ↓
multipart/form-data request
    ↓
Multer middleware
    ↓
Image becomes req.file
    ↓
Text fields become req.body
```

Important:

```text
req.file → uploaded file

req.body → normal text fields
```

Image data:

```js
req.file.buffer
```

---

# Owner Authentication Flow

Owners use a separate login system.

Endpoint:

```text
POST /owners/login
```

Flow:

```text
Owner sends email and password
    ↓
Find owner in database
    ↓
Compare password using bcrypt
    ↓
Generate owner JWT
    ↓
Include role: "owner"
    ↓
Store token in ownerToken cookie
```

Owner token payload:

```js
{
    id: owner._id,
    email: owner.email,
    role: "owner"
}
```

Normal users use:

```text
token
```

Owners use:

```text
ownerToken
```

Keeping them separate makes the authentication flow easier to understand and manage.

---

# Owner Authorization Middleware

The `isOwner` middleware:

```text
Reads ownerToken
    ↓
Token exists?
    ↓ No
401 Owner login required
    ↓ Yes
Verify JWT
    ↓
Find owner in MongoDB
    ↓
Check role === "owner"
    ↓
Attach owner to req.owner
    ↓
next()
```

Product creation is protected by:

```js
isOwner
```

Therefore:

```text
Normal logged-in user
    ↓
Cannot create product

Logged-in owner
    ↓
Can create product
```

---

# Product Creation Flow

Endpoint:

```text
POST /products/create
```

Complete middleware chain:

```text
Request
    ↓
isOwner
    ↓
Verify ownerToken
    ↓
upload.single("image")
    ↓
Multer processes image
    ↓
Check req.file exists
    ↓
Create product in MongoDB
    ↓
Return 201 Created
```

If no image is uploaded:

```text
400 Bad Request
```

This prevents:

```js
req.file.buffer
```

from crashing when `req.file` is undefined.

---

# Add to Cart Flow

Endpoint:

```text
GET /addtocart/:productid
```

> Note: In a more RESTful version, this should ideally use POST rather than GET because it changes data.

Example:

```text
/addtocart/PRODUCT_ID
```

The product ID is available through:

```js
req.params.productid
```

Flow:

```text
Request
    ↓
isLoggedin
    ↓
Find logged-in user
    ↓
Find product using product ID
    ↓
Check whether product already exists in cart
```

If product is already in cart:

```text
quantity += 1
```

If product is not in cart:

```js
{
    product: product._id,
    quantity: 1
}
```

Result:

```text
First click
→ quantity = 1

Second click
→ quantity = 2

Third click
→ quantity = 3
```

This is better than storing duplicate product IDs.

---

# Finding an Existing Cart Item

The cart searches for the product using:

```js
const existingItem = user.cart.find(
    item => item.product.toString() === req.params.productid
);
```

Why `.toString()`?

MongoDB ObjectIds are objects, while URL parameters are strings.

Therefore:

```text
ObjectId !== String
```

Converting the ObjectId to a string allows comparison.

---

# Mongoose `populate()`

The cart stores:

```text
Product ObjectId
```

But the cart response needs:

```text
Product name
Product price
Product discount
```

So the route uses:

```js
.populate("cart.product");
```

Before populate:

```json
{
    "product": "686f123abc..."
}
```

After populate:

```json
{
    "product": {
        "_id": "686f123abc...",
        "name": "Urban Travel Backpack",
        "price": 3499,
        "discount": 500
    },
    "quantity": 2
}
```

Important revision rule:

```text
Old cart structure:
cart: [productId]

Populate:
.populate("cart")
```

```text
Current nested cart structure:
cart: [{ product: productId, quantity: 2 }]

Populate:
.populate("cart.product")
```

---

# Bill Calculation

The cart calculates:

```text
Subtotal
Total Discount
Platform Fee
Final Bill
```

For every cart item:

```js
subtotal += item.product.price * item.quantity;
```

Discount:

```js
totalDiscount += item.product.discount * item.quantity;
```

Final calculation:

```js
finalBill = subtotal - totalDiscount + platformFee;
```

Example:

```text
Product price      = ₹3499
Discount           = ₹500
Quantity           = 2
Platform fee       = ₹20
```

Calculation:

```text
Subtotal:
3499 × 2 = 6998

Total Discount:
500 × 2 = 1000

Final Bill:
6998 - 1000 + 20 = 6018
```

---

# Logout Flow

## User Logout

Endpoint:

```text
POST /users/logout
```

The server clears:

```text
token
```

using:

```js
res.clearCookie("token");
```

After logout:

```text
GET /shop
→ 401 Unauthorized
```

---

## Owner Logout

Endpoint:

```text
POST /owners/logout
```

The server clears:

```text
ownerToken
```

using:

```js
res.clearCookie("ownerToken");
```

After owner logout:

```text
POST /products/create
→ 401 Owner login required
```

---

# Important HTTP Status Codes Used

| Status | Meaning | Used For |
|---|---|---|
| 200 | OK | Login, fetching data |
| 201 | Created | User/product creation |
| 400 | Bad Request | Missing image or invalid input |
| 401 | Unauthorized | Login required or invalid credentials |
| 403 | Forbidden | Authenticated but insufficient permission |
| 404 | Not Found | Product does not exist |
| 409 | Conflict | Duplicate email |
| 500 | Internal Server Error | Unexpected server error |

---

# Complete User Flow

```text
REGISTER
POST /users/register
        ↓
Password hashed
        ↓
User stored in MongoDB
        ↓
JWT generated
        ↓
token cookie created

LOGIN
POST /users/login
        ↓
Email checked
        ↓
Password compared
        ↓
JWT generated
        ↓
token cookie created

SHOP
GET /shop
        ↓
isLoggedin
        ↓
JWT verified
        ↓
Products fetched

ADD TO CART
GET /addtocart/:productid
        ↓
User authenticated
        ↓
Product checked
        ↓
Existing item?
    ↙               ↘
  Yes                No
   ↓                  ↓
quantity + 1      Add quantity 1
        ↓
Save user

VIEW CART
GET /cart
        ↓
Populate cart.product
        ↓
Calculate subtotal
        ↓
Calculate discount
        ↓
Add platform fee
        ↓
Return final bill

LOGOUT
POST /users/logout
        ↓
Clear token cookie
```

---

# Complete Owner Flow

```text
OWNER LOGIN
POST /owners/login
        ↓
Find owner
        ↓
Compare password
        ↓
Generate owner JWT
        ↓
Store ownerToken cookie

CREATE PRODUCT
POST /products/create
        ↓
isOwner middleware
        ↓
Verify ownerToken
        ↓
Multer processes image
        ↓
Create product
        ↓
Save to MongoDB

OWNER LOGOUT
POST /owners/logout
        ↓
Clear ownerToken
```

---

# API Endpoints

## User Routes

| Method | Endpoint | Purpose | Protected |
|---|---|---|---|
| POST | `/users/register` | Register user | No |
| POST | `/users/login` | Login user | No |
| POST | `/users/logout` | Logout user | No |

## Shop and Cart Routes

| Method | Endpoint | Purpose | Protected |
|---|---|---|---|
| GET | `/shop` | Get products | User |
| GET | `/addtocart/:productid` | Add/increase cart item | User |
| GET | `/cart` | View cart and bill | User |

## Owner Routes

| Method | Endpoint | Purpose | Protected |
|---|---|---|---|
| POST | `/owners/login` | Owner login | No |
| POST | `/owners/logout` | Owner logout | No |

## Product Routes

| Method | Endpoint | Purpose | Protected |
|---|---|---|---|
| POST | `/products/create` | Create product | Owner |

---

# Postman Testing Order

For a complete test of the backend:

### User Flow

```text
1. POST /users/register
2. POST /users/login
3. GET /shop
4. GET /addtocart/:productid
5. GET /cart
6. POST /users/logout
7. GET /shop → should return 401
```

### Owner Flow

```text
1. POST /owners/login
2. POST /products/create
3. POST /owners/logout
4. POST /products/create → should return 401
```

---

# Environment Variables

Create a `.env` file:

```env
JWT_KEY=your_secret_key
MONGODB_URI=your_mongodb_connection_string
```

Never commit `.env`.

The `.gitignore` should contain:

```gitignore
node_modules/
.env
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/cipherByte7/ecommerce-backend-api.git
```

Enter the project:

```bash
cd scatch-ecommerce-backend
```

Install dependencies:

```bash
npm install
```

Create `.env` and add the required environment variables.

Start the development server:

```bash
npx nodemon
```

The API runs on:

```text
http://localhost:3000
```

---

# Important Backend Concepts Revised Through This Project

This project helped me understand:

- How Express receives and processes requests
- Router mounting
- Request parameters
- Request bodies
- Middleware execution order
- MongoDB models and schemas
- Mongoose references
- Mongoose `populate()`
- Password hashing
- JWT authentication
- Cookie-based authentication
- Authentication vs authorization
- Protected routes
- Role-based access
- File uploads
- Binary image buffers
- Cart data modelling
- Quantity management
- Bill calculation
- HTTP status codes
- Postman API testing

---

# Key Lessons

### 1. A frontend is only one type of client

The backend does not care whether the request comes from:

```text
React
Android
iOS
EJS
Postman
```

All of them communicate with the backend through HTTP requests.

This project was tested through Postman instead of relying on the original EJS frontend.

---

### 2. Middleware runs before the final route handler

```text
Request
→ Authentication middleware
→ Upload middleware
→ Route handler
→ Response
```

Order matters.

For product creation:

```text
isOwner
→ upload.single("image")
→ create product
```

---

### 3. Authentication and authorization are different

```text
Authentication:
Who are you?

Authorization:
What are you allowed to do?
```

A normal user can be authenticated but still not authorized to create products.

---

### 4. Never trust client-provided identity

Do not ask the client:

```text
Which user are you?
```

Instead:

```text
Verify JWT
→ Get identity from token
→ Find user in database
```

---

### 5. Database references prevent unnecessary duplication

Instead of copying complete products into every cart:

```text
Store Product ObjectId
→ Use populate()
→ Fetch current product data
```

---

# Future Improvements

This project can be extended with:

- Product search and filtering
- Pagination
- Remove from cart
- Decrease cart quantity
- Product image serving endpoint
- Cloud image storage
- Request validation library
- Centralized error handling
- Rate limiting
- CORS configuration
- Automated API tests
- Order creation
- Payment integration
- Deployment

---

# Project Status

The core learning goals of this backend project are complete.

The project currently demonstrates:

```text
Authentication
Authorization
MongoDB relationships
Image uploads
Protected APIs
Shopping cart logic
Billing logic
Role-based access
API testing
```

The next learning goal after this project is to build a smaller backend API independently without following a step-by-step tutorial.

---

## Author

**Aaditya Chitale**

Built as a backend development learning project and extended with additional authentication, authorization, cart, billing, security, and API improvements.
