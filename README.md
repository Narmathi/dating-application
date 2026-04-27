# ❤️ Dating Application

A modern and scalable **Dating Application** built with **Next.js**, **TypeScript**, and **PostgreSQL**, featuring secure authentication, RBAC authorization, and clean API integration.

---

## 🚀 Features

### 👤 User Features
- User Registration & Login
- Profile Creation & Editing


### 🔐 Authentication & Security
- JWT Token-Based Authentication
- Role-Based Access Control (RBAC)
- Protected Routes & APIs
- Secure Middleware Handling

### 🛠️ Admin Features
- Admin Dashboard
- User Management
- Role Management
- Reports & Analytics

---

## 🏗️ Tech Stack

- **Frontend:** Next.js, TypeScript
- **Backend:** Next.js API Routes / Node.js
- **Database:** PostgreSQL
- **Authentication:** JWT + RBAC
- **Styling:** Tailwind CSS / Bootstrap

---


---

## ⚙️ Installation

### 1. Clone the Repository
```bash
# Clone project
git clone https://github.com/your-username/dating-app.git
cd dating-app

# Install dependencies
npm install

# Setup environment
DATABASE_URL="postgresql://user:password@localhost:5432/dating_app"
JWT_SECRET="your_secret_key"


# Run Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# Start app
npm run dev










