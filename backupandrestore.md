# Backup and Restore Process Flow

This document outlines the architecture, permissions, and step-by-step procedures for managing system backups and restoring the application in case of a disaster or migration.

## 1. Granular Permissions Required

Access to the Backup Manager is strictly controlled by granular permissions. Only users assigned a role with these specific permissions can perform the associated actions:

- `view_backups`: Required to access the `/system/backups` page and view the list of existing backups.
- `create_backups`: Required to trigger a new backup manually from the UI.
- `download_backups`: Required to download the encrypted `.zip` backup archive to a local machine.
- `delete_backups`: Required to delete old or unwanted backups from the server to free up space.

---

## 2. Setting Up the Backup Security

To ensure that backups cannot be read by an attacker even if they get access to the downloaded `.zip` file, the backups are encrypted securely independent of the Laravel `APP_KEY`.

1. A custom variable `BACKUP_PASSWORD="YourStrongPasswordHere"` will be set in the `.env` file.
2. The `spatie/laravel-backup` package will dump the MySQL database and the `/storage/app/public` files.
3. The system will bundle these into a `.zip` archive and encrypt the zip file using the custom password.

**CRITICAL RULE:** **Always keep a secure, offline copy of your `.env` file!** Without the `.env` file (containing the `APP_KEY` and the `BACKUP_PASSWORD`), you cannot decrypt the archive or read encrypted database columns after restoring.

---

## 3. The Backup Flow (How to Backup)

### Automated Backups (Cron Job)

1. Every day at a scheduled time (e.g., 2:00 AM), the server's task scheduler triggers the `php artisan backup:run` command.
2. The database is dumped and files are zipped.
3. The resulting `.zip` is saved in `storage/app/backups/`.
4. Optionally, another scheduled task (`backup:clean`) runs to delete backups older than a specific threshold (e.g., 30 days) to preserve server storage.

### Manual Backups (Via UI)

1. An admin with the `create_backups` permission logs in and navigates to **System > Backups**.
2. They click the **"Run Backup Now"** button.
3. The backend API handles the request, runs the backup process asynchronously, and returns a success message when complete.
4. The new backup appears in the history table.

---

## 4. The Download Flow

1. An admin with the `download_backups` permission clicks the **"Download"** button next to a backup record.
2. The backend verifies their permissions.
3. The backend streams the `.zip` file directly to the admin's device.
4. The admin is prompted for the `.zip` password (the `BACKUP_PASSWORD` from `.env`) when they attempt to extract it on their local machine.

---

## 5. The Restore Flow (How to Restore)

_Note: Restoring a database on a live production web server is a high-risk operation. Best practices dictate this is done manually by a Server Admin or DevOps engineer locally or via SSH, rather than through a web UI click. A web-based "1-click restore" can timeout or overwrite the active session causing the system to crash mid-restore._

### Scenario: Total Server Failure (Disaster Recovery)

If the server is destroyed, follow these steps to restore the system on a new server or local machine:

**Step 1: Prepare the New Server**

1. Set up a new server with PHP, Composer, Node, and MySQL.
2. Clone the application repository.
3. Copy your safely backed-up `.env` file into the root of the project.

**Step 2: Extract the Backup**

1. Locate the latest downloaded backup `.zip` file.
2. Extract the file using your `BACKUP_PASSWORD`.
3. Inside, you will find a `db-dumps` folder (containing `mysql-xxxx.sql`) and a copy of the `storage` files.

**Step 3: Restore Database and Files**

1. Log into your new MySQL database and import the raw `.sql` file:
   ```bash
   mysql -u root -p database_name < path/to/mysql-xxxx.sql
   ```
2. Copy the extracted files from the backup's `storage` folder back into the application's `storage/app/` folder.

**Step 4: Finalize Setup**

1. Run `composer install` and `npm install`.
2. Run `php artisan storage:link`.
3. The application is now fully restored exactly to the point of the backup, with all passwords, files, and users intact.
