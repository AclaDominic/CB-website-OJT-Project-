# System Demo & Testing Guide

This guide explains how to run the automated tests to demonstrate the system's capabilities, security, and inventory logic.

## Prerequisites

Ensure your backend is set up (see `SETUP.md`).

## 1. System Capabilities Demo

This test suite verifies the core functionality: Public Pages, Inquiry Submission, and CMS Logic (Services, Projects, Users).

```bash
php artisan test --filter SystemCapabilitiesTest
```

**What this tests:**

- **Public Access**: Verifies public pages (Services, Projects) are accessible (200 OK).
- **Inquiries**: Verifies visitors can submit inquiries and they are saved to the database.
- **Service Management**: Verifies Admins can Create, Update, and Delete services.
- **Project Management**: Verifies Admins can Create, Update, and Delete projects.
- **User Management**: Verifies Admins can Create and Update users with Roles.

## 2. Security & RBAC Demo

This test suite demonstrates the Role-Based Access Control (RBAC) system and API security.

```bash
php artisan test --filter SecurityDemoTest
```

**What this tests:**

- **Unauthorized Access**: Public users cannot access Admin Panel routes (401 Unauthorized).
- **Role Permissions**: Staff members cannot delete projects (403 Forbidden).
- **Admin Privileges**: Admins CAN delete projects (204 Success).
- **Data Protection**: API responses do not leak sensitive data (e.g., password hashes).

## 3. Inventory Logic Demo

This test suite verifies the Inventory Management logic, including stock adjustments and constraints.

```bash
php artisan test --filter InventoryTest
```

**What this tests:**

- **Categories & Items**: Creating inventory categories and items.
- **Stock Adjustments**: Adding and Removing stock updates the quantity.
- **Logic Constraints**: Preventing negative stock (400 Bad Request).

---

## Manual Demo Script

If you prefer to demonstrate the system manually via the UI:

1.  **Login as Admin**:
    - Email: `admin@gmail.com`
    - Password: `password`
2.  **Dashboard**:
    - Observe the dynamic sidebar label (e.g., "Admin" or Initials).
    - Check the **Notification Bell** (top right) for low stock alerts.
3.  **Inventory**:
    - Go to **Inventory** > **Stock Management**.
    - **Add Stock**: Click "+ Restock" on an item.
    - **Consume**: Click "- Consume" until stock is low (below threshold).
    - **Verify**: See the item turn red in the table.
4.  **CMS**:
    - Go to **Projects** or **Services**.
    - Create a new entry and verify it appears.
5.  **Security Check**:
    - Open an Incognito window.
    - Try to access `/admin/users` (should redirect to login or show error).
