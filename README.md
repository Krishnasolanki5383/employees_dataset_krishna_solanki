# 👨‍💼 Employee Management System — REST API

![Status](https://img.shields.io/badge/Backend-Complete%20✅-brightgreen?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-F60?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Year](https://img.shields.io/badge/Year-2026-blue?style=for-the-badge)

> A production-ready **Full Stack Backend REST API** for managing employee records. Built with **Node.js**, **Express.js**, and **MongoDB** following the **MVC architecture**. Supports full CRUD, bulk operations, advanced filtering, JWT authentication, and MongoDB aggregation pipelines.

---

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Folder Structure](#-folder-structure)
- [API Endpoints](#-api-endpoints)
- [Authentication Guide](#-authentication-guide)
- [Example Requests & Responses](#-example-requests--responses)
- [Features](#-features)
- [Postman Collection](#-postman-collection)
- [Author](#-author)

---

## 📌 Project Overview

The **Employee Management System API** provides a complete backend infrastructure for managing organizational employee data. It exposes a RESTful API with endpoints for creating, reading, updating, and deleting employee records, along with advanced querying capabilities such as filtering by skill, domain, city, state, country, and timezone.

The project demonstrates:
- Clean **MVC** architecture separation of concerns
- **JWT-based** stateless authentication
- **MongoDB Aggregation Pipeline** for complex queries
- **Bulk operations** for high-volume data management
- Global **error handling** and middleware layers

---

## 🛠 Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Runtime          | Node.js v18+                        |
| Framework        | Express.js 4.x                      |
| Database         | MongoDB 7.x                         |
| ODM              | Mongoose                            |
| Authentication   | JWT (JSON Web Tokens)               |
| Architecture     | MVC (Model-View-Controller)         |
| API Testing      | Postman                             |
| Environment Vars | dotenv                              |

---

## ✅ Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** `>= v18.0.0`  → [Download](https://nodejs.org/)
- **npm** `>= v9.0.0` (comes with Node.js)
- **MongoDB** `>= v6.0` (local) or a **MongoDB Atlas** cluster → [Get Atlas](https://www.mongodb.com/cloud/atlas)
- **Postman** (for API testing) → [Download](https://www.postman.com/)
- **Git** → [Download](https://git-scm.com/)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Krishnasolanki5383/employees_dataset_krishna_solanki.git
cd employees_dataset_krishna_solanki
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (see [Environment Variables](#-environment-variables) section below).

### 4. Start the Server

```bash
# Development mode (with nodemon auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Verify Server is Running

```
Server running on: http://localhost:5000
MongoDB Connected: ✅
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# ─────────────────────────────────────────
#   Employee Management System — .env
# ─────────────────────────────────────────

# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/employees_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Optional: Logging
LOG_LEVEL=info
```

> ⚠️ **Never commit your `.env` file to version control.** It is already listed in `.gitignore`.

---

## 📁 Folder Structure

```
employees_dataset_krishna_solanki/
│
├── config/
│   ├── db.js               # MongoDB connection setup
│   └── env.js              # Environment variable validation
│
├── controllers/
│   ├── employee.controller.js      # CRUD operations
│   ├── bulkEmployee.controller.js  # Bulk create/update/delete
│   └── filter.controller.js        # Filtering & search logic
│
├── services/
│   ├── employee.service.js         # Core business logic
│   └── aggregation.service.js      # MongoDB Aggregation Pipelines
│
├── models/
│   └── employee.model.js           # Mongoose Employee Schema
│
├── middlewares/
│   ├── auth.middleware.js          # JWT token verification
│   ├── logger.middleware.js        # Request logging
│   ├── error.middleware.js         # Global error handler
│   └── validate.middleware.js      # Request body validation
│
├── routes/
│   ├── employee.routes.js          # CRUD + Bulk routes
│   └── filter.routes.js            # Filter/search routes
│
├── .env                            # Environment variables (not in git)
├── .gitignore
├── server.js                       # Entry point
├── package.json
└── README.md
```

---

## 📡 API Endpoints

Base URL: `http://localhost:5000`

> 🔒 Routes marked with **[AUTH]** require a valid JWT Bearer token in the `Authorization` header.

### 🔧 Basic CRUD Operations

| Method   | Endpoint                    | Description                         | Auth     |
|----------|-----------------------------|-------------------------------------|----------|
| `GET`    | `/employees`                | Fetch all employee records           | 🔒 [AUTH] |
| `GET`    | `/employees/:id`            | Fetch single employee by ID          | 🔒 [AUTH] |
| `POST`   | `/employees`                | Add a new employee record            | 🔒 [AUTH] |
| `PUT`    | `/employees/:id`            | Replace complete employee record     | 🔒 [AUTH] |
| `PATCH`  | `/employees/:id`            | Update specific employee fields      | 🔒 [AUTH] |
| `DELETE` | `/employees/:id`            | Remove an employee record            | 🔒 [AUTH] |
| `GET`    | `/employees/exists/:id`     | Check if an employee exists          | 🔒 [AUTH] |

### 📦 Bulk Operations

| Method   | Endpoint                    | Description                         | Auth     |
|----------|-----------------------------|-------------------------------------|----------|
| `POST`   | `/employees/bulk-create`    | Insert multiple employee records     | 🔒 [AUTH] |
| `PATCH`  | `/employees/bulk-update`    | Update multiple employees at once    | 🔒 [AUTH] |
| `DELETE` | `/employees/bulk-delete`    | Delete multiple employees at once    | 🔒 [AUTH] |

### 🔍 Filter & Search Routes

| Method | Endpoint                                | Description                        | Auth     |
|--------|-----------------------------------------|------------------------------------|----------|
| `GET`  | `/employees/name/:name`                 | Fetch employees by name            | 🔒 [AUTH] |
| `GET`  | `/employees/state/:state`               | Fetch employees by state           | 🔒 [AUTH] |
| `GET`  | `/employees/country/:country`           | Fetch employees by country         | 🔒 [AUTH] |
| `GET`  | `/employees/city/:city`                 | Fetch employees by city            | 🔒 [AUTH] |
| `GET`  | `/employees/timezone/:timezone`         | Fetch employees by timezone        | 🔒 [AUTH] |
| `GET`  | `/employees/primary-skill/:skill`       | Fetch by primary skill             | 🔒 [AUTH] |
| `GET`  | `/employees/secondary-skill/:skill`     | Fetch by secondary skill           | 🔒 [AUTH] |
| `GET`  | `/employees/domain/:domain`             | Fetch employees by domain          | 🔒 [AUTH] |
| `GET`  | `/employees/experience/:years`          | Fetch by years of experience       | 🔒 [AUTH] |
| `GET`  | `/employees/certification/:cert`        | Fetch by certification             | 🔒 [AUTH] |
| `GET`  | `/employees/verified`                   | Fetch all verified employees       | 🔒 [AUTH] |
| `GET`  | `/employees/projects`                   | Fetch all employee projects        | 🔒 [AUTH] |
| `GET`  | `/employees/tasks`                      | Fetch all employee tasks           | 🔒 [AUTH] |
| `GET`  | `/employees/top-experience`             | Fetch most experienced employees   | 🔒 [AUTH] |

---

## 🔑 Authentication Guide

This API uses **JWT (JSON Web Token)** for stateless authentication.

### Step 1 — Login to get a token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

### Step 2 — Use the token in all protected requests

Add the token to the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### In Postman:
1. Go to the **Authorization** tab
2. Select **Bearer Token**
3. Paste your JWT token

> 🕒 Tokens expire in **7 days** by default (configurable via `JWT_EXPIRES_IN` in `.env`).

---

## 📝 Example Requests & Responses

### 1️⃣ Create a New Employee

**Request:**
```http
POST /employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Krishna Solanki",
  "email": "krishna@example.com",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "country": "India",
  "timezone": "Asia/Kolkata",
  "primarySkill": "Node.js",
  "secondarySkill": "React.js",
  "domain": "Backend Development",
  "experience": 3,
  "certifications": ["AWS Certified", "MongoDB Associate"],
  "verified": true
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "_id": "6650f3a2e4b0c1234abcd001",
    "name": "Krishna Solanki",
    "email": "krishna@example.com",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "country": "India",
    "timezone": "Asia/Kolkata",
    "primarySkill": "Node.js",
    "secondarySkill": "React.js",
    "domain": "Backend Development",
    "experience": 3,
    "certifications": ["AWS Certified", "MongoDB Associate"],
    "verified": true,
    "createdAt": "2026-05-27T17:00:00.000Z",
    "updatedAt": "2026-05-27T17:00:00.000Z"
  }
}
```

---

### 2️⃣ Fetch All Employees (with Pagination)

**Request:**
```http
GET /employees?page=1&limit=10&sort=experience&order=desc
Authorization: Bearer <token>
```

**Response — 200 OK:**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15,
  "data": [
    {
      "_id": "6650f3a2e4b0c1234abcd001",
      "name": "Krishna Solanki",
      "primarySkill": "Node.js",
      "experience": 3,
      "country": "India"
    }
  ]
}
```

---

### 3️⃣ Bulk Create Employees

**Request:**
```http
POST /employees/bulk-create
Authorization: Bearer <token>
Content-Type: application/json

{
  "employees": [
    { "name": "Alice Johnson", "primarySkill": "Python", "experience": 5 },
    { "name": "Bob Smith",     "primarySkill": "Java",   "experience": 8 },
    { "name": "Riya Patel",    "primarySkill": "React",  "experience": 2 }
  ]
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "message": "3 employees created successfully",
  "insertedCount": 3,
  "data": [ ... ]
}
```

---

## ✨ Features

- ✅ **Complete CRUD** — Create, Read, Update (PUT/PATCH), Delete operations for employees
- ✅ **Bulk Operations** — Insert, update, and delete multiple records in a single request
- ✅ **Advanced Filtering** — Filter by skill, domain, city, state, country, timezone, experience
- ✅ **JWT Authentication** — Stateless, secure token-based auth with protected routes
- ✅ **Middleware System** — Auth, request logging, global error handling, input validation
- ✅ **MongoDB Aggregation** — Complex queries using MongoDB Aggregation Pipeline
- ✅ **Pagination & Sorting** — `page`, `limit`, `sort`, `order` query param support
- ✅ **MongoDB Indexing** — Performance-optimized indexes on frequently queried fields
- ✅ **Global Error Handling** — Centralized error middleware with consistent error format
- ✅ **RESTful Design** — Standard HTTP methods, status codes, and response structures
- ✅ **Environment Config** — Full `.env` support via `dotenv` for all sensitive values

---

## 📮 Postman Collection

A full Postman collection is available for testing all API endpoints.

### To use:
1. Open **Postman**
2. Click **Import** → **Link**
3. Paste the collection URL *(add your shared link here)*

> 💡 **Tip:** Set a Postman environment variable `{{token}}` after login and use `{{token}}` as your Bearer token across all requests automatically.

### Environment Variables in Postman:

| Variable    | Value                          |
|-------------|--------------------------------|
| `base_url`  | `http://localhost:5000`        |
| `token`     | *(paste JWT after login)*      |

---

## 👨‍💻 Author

**Krishna Solanki**

- 🐙 GitHub: [@Krishnasolanki5383](https://github.com/Krishnasolanki5383)
- 💼 Project: Employee Management System REST API
- 📅 Year: 2026
- 🏗️ Architecture: MVC | Node.js | Express | MongoDB | JWT

---

<div align="center">

**⭐ Star this repo if you find it useful!**

![Backend Complete](https://img.shields.io/badge/Backend-Complete%20✅-brightgreen?style=for-the-badge)

</div>