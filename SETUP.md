# Project Setup Guide

This guide covers how to set up the project locally, including backend (Laravel) and frontend (React/Vite).

## Prerequisites

- **PHP**: 8.2 or higher
- **Composer**: Dependency Manager for PHP
- **Node.js**: 18+ and NPM
- **MySQL**: Database server

## 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

## 2. Backend Setup (Laravel)

Navigate to the backend directory:

```bash
cd backend
```

### Install Dependencies

```bash
composer install
```

### Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Open `.env` and set your database credentials:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name  # Ensure this database exists in MySQL
DB_USERNAME=root
DB_PASSWORD=
```

### Application Key & Migrations

Generate the app key and run migrations:

```bash
php artisan key:generate
php artisan migrate
```

### Seeding Data

Populate the database with initial data.

**Option A: Full Seed (Users, Roles, Departments)**

```bash
php artisan db:seed
```

_Note: This creates a default admin user: `admin@gmail.com` / `password`_

**Option B: Inventory Seed (Categories, Items)**
If you are setting up the Inventory module specifically:

```bash
php artisan db:seed --class=InventorySeeder
```

### Storage Link

Link the public storage to access uploaded files:

```bash
php artisan storage:link
```

### 4. Run the Backend Servers

You need to run two backend processes: the local HTTP server, and the Laravel Reverb WebSocket server for real-time dashboard notifications.

Open **two** terminal instances in the `backend/` directory:

**Terminal A (HTTP):**

```bash
php artisan serve
```

The HTTP backend will run at `http://localhost:8000`.

**Terminal B (WebSockets):**

```bash
php artisan reverb:start
```

---

## 5. Frontend Setup (React + Vite)

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Copy the example environment file (if available) or create one:

```bash
cp .env.example .env
```

Ensure the API URL points to your Laravel backend in `.env`:

```ini
VITE_API_BASE_URL=http://localhost:8000
```

### Sync WebSockets (Reverb) Configuration

To easily copy your backend Reverb settings to the frontend without manual copying, use the artisan command from the `backend/` directory:

```bash
# from the backend directory
php artisan env:sync-frontend
```

This will automatically extract all `VITE_` variables from the backend `.env` and configure your frontend `.env`.

### Run Development Server

```bash
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 4. Scheduler (for Notifications)

The system uses a scheduled task to check for low stock daily. To test this locally, you can run the command manually:

```bash
php artisan inventory:check-low-stock
```

For production, you would set up a cron job to run `php artisan schedule:run` every minute.

## Troubleshooting

- **Permission Issues**: Ensure `storage` and `bootstrap/cache` directories are writable.
- **Missing Tables**: Run `php artisan migrate`.
- **Import Errors**: If frontend fails, try deleting `node_modules` and running `npm install` again.
