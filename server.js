const express = require('express');
const app = express();

const PORT = 3000; // DONT CHANGE THIS UNLESS NECESSARY

app.use(express.json());

// IN-MEMORY DATABASE
// User structure:
// { id, username, password, balance }
const users = [];

// Item structure:
// { id, name, price, sellerId, isSold }
const items = [
  {
    id: 'item_1',
    name: 'Vintage Watch',
    price: 150,
    sellerId: 'admin',
    isSold: false
  },
  {
    id: 'item_2',
    name: 'Wireless Headphones',
    price: 80,
    sellerId: 'admin',
    isSold: false
  }
];

let nextUserId = 1;
let nextItemId = 3;

// DUMMY AUTH MIDDLEWARE
// Protected routes expect:
//
// x-user-id: <user_id>
//
// TODO:
// - Read the user ID from the x-user-id request header.
// - Find the corresponding user.
// - If the header is missing, respond with status 401.
// - If the user does not exist, respond with status 401.
// - Attach the authenticated user to req.user.
// - Call next() when authentication succeeds.
//
// Protected routes:
// - POST /api/deposit
// - POST /api/items/sell
// - POST /api/items/buy/:id

const dummyAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
};


// 1. CREATE ACCOUNT
// POST /api/register
//
// Request body:
// {
//   username: "...",
//   password: "..."
// }
//
// Requirements:
// - username is required.
// - password is required.
// - username must be unique.
// - Create a new user with a unique ID.
// - New users start with balance 0.
// - Do not return the user's password.
//
// Success:
// - Status: 201
// - Response must contain:
//   {
//     user: {
//       id,
//       username,
//       balance
//     }
//   }
//
// Errors:
// - Missing username or password: status 400
// - Duplicate username: status 400

app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    username.trim() === '' ||
    typeof password !== 'string' ||
    password === ''
  ) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: `user_${nextUserId++}`,
    username,
    password,
    balance: 0
  };

  users.push(newUser);

  return res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      balance: newUser.balance
    }
  });
});

// 2. LOGIN
// POST /api/login
//
// Request body:
// {
//   username: "...",
//   password: "..."
// }
//
// Requirements:
// - Check the submitted username and password.
// - The credentials must match an existing user.
// - Return the user's ID when login succeeds.
//
// Success:
// - Status: 200
// - Response must contain:
//   {
//     userId
//   }
//
// Error:
// - Invalid credentials: status 401

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    username.trim() === '' ||
    typeof password !== 'string' ||
    password === ''
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.status(200).json({ userId: user.id });
});


// 3. DEPOSIT FUNDS
// POST /api/deposit
// Protected
//
// Request body:
// {
//   amount: 150
// }
//
// Requirements:
// - User must be authenticated.
// - amount must be a number.
// - amount must be greater than 0.
// - Add the amount to the authenticated user's balance.
//
// Success:
// - Status: 200
// - Response must contain:
//   {
//     newBalance
//   }
//
// Errors:
// - Missing/invalid authentication: status 401
// - Invalid amount: status 400
//
// Examples of invalid amounts:
// - -50
// - 0
// - "one-hundred"

app.post('/api/deposit', dummyAuth, (req, res) => {
  const { amount } = req.body || {};

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  req.user.balance += amount;

  return res.status(200).json({ newBalance: req.user.balance });
});

// 4. GET AVAILABLE ITEMS
// GET /api/items
//
// Requirements:
// - Return all items that have not been sold.
// - Items where isSold is true must not be included.
//
// Success:
// - Status: 200
// - Response must contain:
//   {
//     items: []
//   }

app.get('/api/items', (req, res) => {
  const availableItems = items.filter((item) => item.isSold === false);

  return res.status(200).json({ items: availableItems });
});


// 5. LIST ITEM FOR SALE
// POST /api/items/sell
// Protected
//
// Request body:
// {
//   name: "Keyboard",
//   price: 100
// }
//
// Requirements:
// - User must be authenticated.
// - name is required.
// - price must be a number.
// - price must be greater than 0.
// - Create a new item with a unique ID.
// - sellerId must be the authenticated user's ID.
// - New items must have isSold set to false.
//
// Success:
// - Status: 201
// - Response must contain:
//   {
//     item: {
//       id,
//       name,
//       price,
//       sellerId,
//       isSold
//     }
//   }
//
// Errors:
// - Missing/invalid authentication: status 401
// - Invalid name or price: status 400

app.post('/api/items/sell', dummyAuth, (req, res) => {
  const { name, price } = req.body || {};

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Invalid name or price' });
  }

  if (typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Invalid name or price' });
  }

  const newItem = {
    id: `item_${nextItemId++}`,
    name,
    price,
    sellerId: req.user.id,
    isSold: false
  };

  items.push(newItem);

  return res.status(201).json({ item: newItem });
});

// 6. BUY ITEM
// POST /api/items/buy/:id
// Protected
//
// The item ID is provided through the route parameter.
//
// Example:
// POST /api/items/buy/item_123
//
// Requirements:
// - User must be authenticated.
// - Find the item using the route parameter.
// - The item must exist.
// - The item must not already be sold.
// - A user cannot buy their own item.
// - The buyer must have enough balance.
// - Deduct the item price from the buyer.
// - Add the item price to the seller's balance.
// - Mark the item as sold.
// - Return the buyer's remaining balance and the purchased item.
//
// Success:
// - Status: 200
// - Response must contain:
//   {
//     remainingBalance,
//     item
//   }
//
// Errors:
// - Missing/invalid authentication: status 401
// - Item does not exist: status 404
// - Item is already sold: status 400
// - Buyer is the seller: status 400
// - Insufficient balance: status 400

app.post('/api/items/buy/:id', dummyAuth, (req, res) => {
  const itemId = req.params.id;
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (item.isSold) {
    return res.status(400).json({ error: 'Item is already sold' });
  }

  if (item.sellerId === req.user.id) {
    return res.status(400).json({ error: 'Cannot buy your own item' });
  }

  if (req.user.balance < item.price) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const seller = users.find((u) => u.id === item.sellerId);

  req.user.balance -= item.price;
  if (seller) {
    seller.balance += item.price;
  }
  item.isSold = true;

  return res.status(200).json({
    remainingBalance: req.user.balance,
    item
  });
});

// SERVER
// Only start the server when this file is run directly.
// This allows test.js to import the Express app
// without starting another server automatically.

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express app for testing.
module.exports = app;
