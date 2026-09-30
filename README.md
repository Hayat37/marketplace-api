# Marketplace API

A RESTful marketplace API built with **Node.js** and **Express.js**.

This project provides a simple backend for user registration, authentication, account balance management, and buying and selling items.

## Features

* User registration
* User login
* Simple authentication middleware
* User balance management
* Item listing
* Selling items
* Buying items
* Request validation
* HTTP status code handling
* In-memory data storage
* Automated API tests

## Technologies

* Node.js
* Express.js
* JavaScript
* npm

## API Endpoints

| Method | Endpoint             | Description                                   |
| ------ | -------------------- | --------------------------------------------- |
| POST   | `/api/register`      | Register a new user                           |
| POST   | `/api/login`         | Log in a user                                 |
| POST   | `/api/deposit`       | Add money to the authenticated user's balance |
| GET    | `/api/items`         | Get available items                           |
| POST   | `/api/items/sell`    | Add an item for sale                          |
| POST   | `/api/items/buy/:id` | Purchase an item                              |

## Authentication

The API uses a simple authentication mechanism based on the `x-user-id` request header.

Example:

```http
x-user-id: 1
```

Protected routes use this header to identify the current user.

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:Hayat37/marketplace-api.git
```

### 2. Open the project

```bash
cd marketplace-api
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the server

```bash
node server.js
```

The API will run on the configured local port.

## Testing

Run the automated tests with:

```bash
npm test
```

The project includes a local test suite covering the main API functionality.

## Project Structure

```text
marketplace-api/
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── test.js
```

## Project Purpose

This project demonstrates practical backend development using Express.js, including REST API design, routing, authentication, validation, and business logic.

