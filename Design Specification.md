# Design Specification
## Architectural Design

### Architecture Diagram:
![Architecture Diagram](docs/Architecture.png?raw=true)

### Mockups

#### Web UI (UData):

    Login Page: A simple form for entering username and password, with a link to the registration page.
![Login Page](docs/LoginPage.png?raw=true)
    Landing: A landing page displaying a list of databases, with options to create new databases, import/export databases, and manage permissions.
![Landing Page](docs/LandingPage.png?raw=true)
    Database View: A page for viewing and managing a specific database, with options for CRUD operations, filtering, and sorting.

#### CLI (mpdb):

    **Command Examples**:
- mpdb start: Start the daemon.
- mpdb status: Check the status of the daemon.
- mpdb stop: Stop the daemon.
- mpdb register --payload '{"username": "user1", "password": "pass1"}': Register a new user.
- mpdb send-request --action "createDatabase" --payload '{"dbName": "mydb"}': Create a new database.