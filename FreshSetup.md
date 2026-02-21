# Fresh Setup Guide

If you just cloned this repository from GitHub for the very first time, follow these steps in order to get the entire project (Backend + Frontend) running locally.

## Prerequisites

- **PHP 8.2+** and **Composer**
- **Node.js 18+** and **npm**
- **MySQL** (Ensure your local database server is running)

---

## Part 1: Backend Setup (Laravel)

Open your terminal and navigate into the `backend` folder:

```bash
cd backend
```

### 1. Install PHP Dependencies

```bash
composer install
```

### 2. Configure Environment

Copy the example environment file to create your active `.env` file:

```bash
cp .env.example .env
```

Open `.env` in your code editor and update the database credentials to match your local MySQL setup:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cliberduche  # Create this database in MySQL first!
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Generate App Key & Link Storage

```bash
php artisan key:generate
php artisan storage:link
```

### 4. Install WebSockets (Laravel Reverb)

Because the project uses real-time dashboard updates, you need to install Reverb and generate its unique keys for your environment.

Run the following command:

```bash
php artisan install:broadcasting
```

_(When prompted, type `yes` to install Laravel Reverb, and type `yes` to build the Node dependencies. This will automatically generate the `REVERB_APP_KEY` and other WebSocket credentials in your backend `.env` file.)_

### 5. Migrate and Seed the Database

This command will create all the necessary tables and populate them with default admin users, real-world data, and inventory stock:

```bash
php artisan migrate --seed
```

_(Default Admin Login: `admin@gmail.com` / `password`)_

---

## Part 2: Frontend Setup (React/Vite)

Open a **new** terminal window and navigate into the `frontend` folder:

```bash
cd frontend
```

### 1. Install Node Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Sync WebSockets (Laravel Reverb)

Because real-time features like the dashboard alerts use Laravel Reverb, the frontend needs the exact same WebSocket keys as the backend.

Instead of copying them manually, run this custom command **from your backend terminal**:

```bash
# Run this inside the /backend directory
php artisan env:sync-frontend
```

This will automatically extract the `VITE_` and `REVERB_` variables from your backend and inject them directly into your frontend `.env` file!

---

## Part 3: Running the Application

To run the application locally with full real-time support, you need **three** terminal windows active simultaneously.

**Terminal 1 (Backend API):**

```bash
cd backend
php artisan serve
```

**Terminal 2 (Backend WebSockets):**

```bash
cd backend
php artisan reverb:start
```

**Terminal 3 (Frontend React App):**

```bash
cd frontend
npm run dev
```

Your frontend application is now successfully running at `http://localhost:5173`. You can log in, view live dashboard alerts, and manage the system!
