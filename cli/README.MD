# 🧰 MPDBcli

`mpdbc` is a command-line interface tool designed to interact with the mpdbd that handles user sessions, registration, authentication, and various database operations. It provides an intuitive CLI for managing databases, collections, documents, and user interactions.

---

## ✨ Features

### Daemon Management
- Start, stop, and monitor the status of the background daemon.

### User Management
- Register, login, logout, and check the active session.

### Custom Requests
- Send arbitrary actions to the daemon.

### Database Operations
- **Basic Commands**: Create and delete databases.
- **Advanced Management**: Manage collections/documents (create, add, update, delete).
- **Load/Unload Databases**: Temporarily load a database for exclusive management.
- **Database Sharing**: Share/unshare databases with other users.

### Visual Enhancements
- Custom ASCII art logos and colorized terminal output using `chalk` and `figlet`.

---

## 🚀 Installation

1. Clone the repository containing `cli`.
2. Ensure you have Node.js installed.
3. Install dependencies by running:
    ```bash
    npm install
    ```
4. Confirm that the daemon source is located at `../../daemon/src/mpdbd.ts` relative to the CLI script.

---

## 📦 Usage

Execute the CLI using `npx`:
```bash
npx tsx cli.ts <command> [options]
```

---

## 🔧 Commands

### 📌 Daemon Control
- **Start**: Starts the daemon process in detached mode.
  ```bash
  npx tsx cli.ts start
  ```
- **Status**: Checks if the daemon is currently running.
  ```bash
  npx tsx cli.ts status
  ```
- **Stop**: Stops the running daemon process.
  ```bash
  npx tsx cli.ts stop
  ```

### 👤 User Management
- **Register**: Registers a new user.
  ```bash
  npx tsx cli.ts register --payload '{"username":"alice","password":"mypassword"}'
  ```
- **Login**: Logs in a user and stores a session with a JWT token.
  ```bash
  npx tsx cli.ts login alice mypassword
  ```
- **Logout**: Logs out the current user by removing the session file.
  ```bash
  npx tsx cli.ts logout
  ```
- **Whoami**: Displays the username of the logged-in user.
  ```bash
  npx tsx cli.ts whoami
  ```

### 📡 Server Interaction
- **Send Request**: Sends a custom action and payload to the daemon.
  ```bash
  npx tsx cli.ts send-request --action "someAction" --payload '{"data":"value"}'
  ```
- **Public Databases**: Fetches and displays all public databases.
  ```bash
  npx tsx cli.ts public-databases
  ```
- **My Databases**: Retrieves databases belonging to the logged-in user.
  ```bash
  npx tsx cli.ts my-databases
  ```
- **Create Database**: Creates a new database.
  ```bash
  npx tsx cli.ts create-database --name <database_name>
  ```
- **Delete Database**: Deletes an existing database.
  ```bash
  npx tsx cli.ts delete-database --name <database_name>
  ```

### 🗄️ Advanced Database Management
- **Manage Database**: Perform operations like adding, updating, or deleting documents.
  - Add a document:
     ```bash
     npx tsx cli.ts manage-database --db-id 12345 --operation Add --collection myCollection --doc-data /path/to/doc.json
     ```
  - Update a document:
     ```bash
     npx tsx cli.ts manage-database --db-id 12345 --operation Update --collection myCollection --doc-id abc123 --doc-data /path/to/updatedDoc.json
     ```
  - Delete a document:
     ```bash
     npx tsx cli.ts manage-database --db-id 12345 --operation Delete --collection myCollection --doc-id abc123
     ```

- **Load Database**: Loads a specific database for exclusive management.
  ```bash
  npx tsx cli.ts load-database --db-id 12345
  ```
- **Unload Database**: Unloads a previously loaded database.
  ```bash
  npx tsx cli.ts unload-database --db-id 12345
  ```
- **Share Database**: Shares a database with another user.
  ```bash
  npx tsx cli.ts share-database --user-name bob --db-id 12345 --permission read
  ```
- **Unshare Database**: Revokes sharing of a database with a user.
  ```bash
  npx tsx cli.ts unshare-database --user-name bob --db-id 12345 --permission read
  ```

---

## 🎨 Visuals

When you start the daemon or execute certain commands, a custom ASCII art logo is rendered using `chalk` to enhance the CLI experience.

---

## 🧪 Example Workflow

```bash
# Start the daemon
npx tsx cli.ts start

# Register a new user
npx tsx cli.ts register --payload '{"username":"bob","password":"secure123"}'

# Log in with the new user credentials
npx tsx cli.ts login bob secure123

# Verify current user
npx tsx cli.ts whoami

# Retrieve public databases
npx tsx cli.ts public-databases

# Create a new database
npx tsx cli.ts create-database --name myNewDB

# Manage a database by adding a document to a collection
npx tsx cli.ts manage-database --db-id 12345 --operation Add --collection orders --doc-data /path/to/doc.json

# Load a database for exclusive management
npx tsx cli.ts load-database --db-id 12345

# Share the database with another user
npx tsx cli.ts share-database --user-name alice --db-id 12345 --permission write

# Unshare the database with the user
npx tsx cli.ts unshare-database --user-name alice --db-id 12345 --permission write

# Unload the database after modifications
npx tsx cli.ts unload-database --db-id 12345

# Stop the daemon when finished
npx tsx cli.ts stop
```

---

## 🛠️ Dependencies

- `commander`
- `chalk`
- `figlet`
- Node.js built-in modules: `fs`, `net`, `child_process`, `process`

---