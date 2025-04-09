# Requirement Specification

## Introduction

### Purpose

This document outlines the requirements for an MPDB. A lightweight, NoSQL database system that is designed to provide useful features. These features include flexible data storage, efficient data retrieval, and secure management. This MPBD software aims to serve developers, administrators, and end0susers with an intuitive interface.

### Scope

Our NoSQL database will support JSON-based data storage , CRUD operations, and a simple query language. It will include a CLI (command line interface) and a web-based UI for client interaction. It will also include a daemon which will act as the engine and will take charge of all backend operations. Strong security features such as authentication and permission-based authorization will also be included.

### Overall Background

In modern society, a demand for lightweight, flexible databases has shown growth. Our project addresses this need by combining the flexibility of NoSQL with a user-friendly interface along with powerful encryption security. This makes the system suitable for individual developers as well as for small teams.

## **Functional Requirements**

## R1: Database management

### R1.1: Create and Manage the database

- User should be able to create, edit, and manage the overall database such that the data can be stored and organised.
- Users should be able to create a new database with a specified name.
- Users should be able to perform CRUD operations on all the data in the database.
  - Create
  - Read
  - Update
  - Delete
- Before inserting data into the database, users should be able to validate it.
- Users should be able to add metadata to the database, this includes:
  - Owners
  - Collaborators
  - Users
  - Access editing

### R1.2: Data filtering and data searching

- Users should be able to apply filters to database queries.
- Users should be able to sort data in a table, either by picking one or more fields.
- The filtering and sorting will use JavaScript for implementation on the client side.

### R1.3: Importing and Exporting databases

- User should be able to import and export data bases using JSON files.
- For exports, the prototype design pattern will be used to clone the database and then from there converted into a JSON file.

## R2: Collaboration and Permissions

### R2.1: Adding Collaborators

- Users are able to invite collaborators via their email.
- Permission can be specified for each collaborator, this includes:
  - Read only
  - Write
  - Admin
- This will form part of the metadata

### R2.2: Managing permissions

- Admins should be able to modify permissions for all users.
- Using the memento design pattern, admins should be able to restore previous states of the database.
- Public databases will all be read only for security reasons.

## R3: Daemon

### R3.1: External connections

- The daemon should allow external connections through sockets to enable interaction with the system.
- The daemon will listen on a specific port for incoming socket connections.
- The daemon should be able to support synchronous communication.
- The daemon should also be used to authenticate all external requests.

### R3.2: Storing JSON format

- The daemon should parse and store JSON files so that data is managed in a structured format.
- The JSON structure will be predefined.

### R3.3: Query Optimisation

- Queries should be optimised in order for user to retrieve data faster.
- Indexing will be used to by the daemon.
- The daemon should be able to support filtered responses.

### R3.4: Database Management

- The daemon should support database creation with specified names as well as specified structures.
- Users should be able to perform CRUD operations on the database through the daemon.
- Concurrent access to the databases should be handled concurrently. \*

## R4: CLI interface

### R4.1: Connecting to the Daemon

- The daemon shall be connected to via CLI. This will be done using certain command lines.
- Only one connection should be permitted at a time. Using the singleton design pattern will help ensure this.
- Users should use authentication in order to connect to the daemon, this authentication refers to:
  - Username (email)
  - Password
- The CLI commands should also be able to perform CRUD operations.

### R4.2: Batch Operations

- Large databases will sometimes require batch operations and so this should be an option when using CLI.
- This means being able to execute multiple CRUD commands in a single batch.

## R5: Web UI (API and User Interface)

### R5.1: Responsive Interface

- The user interface should be accessible on all devices. This includes:
  - Desktops
  - Cell phones
  - Tablets
- The web UI should contain the following:
  - A login page which requests for Username and password along with a register option for first time users.
  - A landing page which includes the following:
    - A dashboard
    - A side panel with filters and different options.
    - A search bar
    - All of the public, read-only databases ( or limited to a certain number of them depending on the size)
    - Import and export functions
  - A data viewing page
    - This is where all the CRUD operations and viewing of each database will take place.

### R5.2: REST API

- The REST API will integrate the system with the other applications.
- The API should support all authentication
  - This includes hashing private data for security.
- The API will include endpoints which will be used for management, querying, and overall management.

## R6: Security

### R6.1: Encryption

- Data should be encrypted so that everything is secure.
- All encryption keys are to be managed securely.
- Data is encrypted at rest and in transit.

### R6.2: Password Hashing

- Hashing will be used to prevent any unauthorized access, this keeping the databases secure.
- User passwords will be hashed using a secure hashing algorithm.
- A trusted library will be used for the password hashing.

### R6.2: Logging in and out

- Users will login by using their credentials ( username and password )
- Logging out will terminate current session.

## R7: Documentation and Guides

### R7.1: Comprehensive Documentation

- The system shall include detailed documentation for all components, including the daemon, CLI, REST API, and web UI.
- Documentation shall cover installation, configuration, usage, and troubleshooting.

### R7.2: User Manuals

- A user manual shall be provided for the CLI and web UI, detailing how to perform common tasks and operations.
- The manual shall include examples and step-by-step instructions.

### R7.3: Developer Guides

- A developer guide shall be provided for the JavaScript/TypeScript client library (mpdbjs), detailing how to integrate and use the library in external applications.
- The guide shall include API references, code examples, and best practices.

## R8: Testing

### R8.1: Unit Tests

- Unit tests shall be written for all critical components of the system to ensure individual units of code function as expected.
- Unit tests shall cover core functionalities such as database operations, authentication, and permission management.

### R8.2: Integration Tests

- Integration tests shall be conducted to ensure that different components of the system work together as expected.
- Integration tests shall cover scenarios such as user authentication, database creation, and CRUD operations.

## R9: Docker Containers

### R9.1: Dockerfiles

- Dockerfiles shall be provided for each component of the system (mpdbd, mpdb, mpdbjs, mpdb-api, mpdb-studio) to facilitate easy deployment.
- Each Dockerfile shall include instructions for building and running the respective component.

### R9.2: Docker Compose

- A Docker Compose file shall be provided to orchestrate the entire system, allowing all components to be run together with a single command.
- The Docker Compose file shall include configurations for networking, environment variables, and dependencies.

### R9.3: README Instructions

- A README file shall be provided with clear instructions for building and running the Docker containers.
- The README shall include examples of common commands and configurations.

## **Non-Functional Requirements**

### NF1: Performance

- System will provide concurrency, allowing up to 100 users to access it at the same time with minimal latency.
- Batch operations should be processed in no more than 5 seconds.

### NF2: Scalability

- The daemon should be able to scale horizontally to support additional nodes as the volume of data grows.

### NF3: Usability

- The CLI shall include help commands and clear error messages.
- The web User interface will follow all accessibility standards.

### NF4: Security

- Audit logs shall tack all users’ actions for accountability.
- All user’s information shall be encrypted using bcrypt.
- Brute force attacks on user information will not be possible.

### NF5: Portability

- Our project will run on Linux, macOS, and Windows without any sort of modifications.
- The web user interface will be compatible with modern browsers such as Chrome, Safari, Firefox and more.

# Use Case Diagram
![Use Case](docs/UseCase.png?raw=true)



# Daemon

## Pre-requisites
- nodejs
- npm

## Run Commands:
- npm add --save-dev @types/node
- npm i -D tsx
- npm install jsonwebtoken

## Starting the daemon
Run:
    `npx tsx mpdbd.ts`
to start the daemon

## Requests and Responses
- Requets must be in the format as defined in "ResponseRequestInterface.ts"
- Respones will be in a JSON encoded format as defined in "ResponseRequestInterface.ts"


## Data Templates

### User Template
```json
[
    {
    "_id": "string",
    "JWT": "string",
    "username": "string",
    "admin": "boolean",
    "name": "string",
    "surname": "string",
    "email": "string",
    "password": "string hased password",
    "profileImage": "string url",
    "databases": ["string array of db ids"],
    "saveddatabases": ["string"],
    "followers": ["string"],
    "following": ["string"]
    }
]
```

### Database Template
```json
[
{
    "_id": "string", 
    "name": "string", 
    "owner": "string", 
    "isPublic": "boolean",
    "createdAt": "ISO date string", 
    "updatedAt": "ISO date string", 
    "description": "string", 
    "tags": ["string array"],
    "collections": ["Array of collection file names"],
    "permissions": { 
      "read": ["userID array"], 
      "write": ["userID array"]
    }
  }
]
```

# Request Types (Daemon, Rest API, CLI)
**action: login**  
Payload:
```json
{
    "username": "string",
    "password": "string"
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Checks if the user provided the correct login and password details.
- Implemented within Auth.ts
- Used for authorization, jwt verification and other api/jslib authorization stuff
---

**action: register**  
Payload:
```json
    {
    "username": "string",
    "name": "string",
    "surname": "string",
    "email": "string",
    "password": "string hased password",
    "profileImage": "string url", //Optional
    }
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Add's a new user to the users.json file
- Username must be unique 

---

**action: getAPIkey**  
Payload:
```json
{
    "username": "string",
    "password": "string"
}
```
Response:  
- `status = 200` if successful  
- api key on message with expiry date  
- Only one at a time

Description:
- Generates a JWT token 
- The user is responsible for ensuring the safety of their token
- JWT tokens will be used to authorize operations
- JWT tokens expire after x amount (timeout time TBA)
- A user can only have a single JWT token at a time
---

**action: revokeAPIkey**  
Payload:
```json
{
    "username": "string",
    "password": "string",
}
```
Response:  
- `status = 200` if successful  
- api key on message with expiry date  
- Only one at a time

Description:
- Revokes an JWT token

---

**action: updateUser**  
Payload:
```json
{
    "apiKey": "string",
    "userID": "string",
    "userData": {}
}
```
Response:  
- `status = 200` if successful  
- api key on message with expiry date  
- Only one at a time

Description:
- Updates a user in users.json file
- JWT needs to have the admin field set
---

**action: getPublicDatabases**  
Payload:
```json
{
    "limit": "number",
    "offset": "number"
}
```
Response:  
- `status = 200` if successful  
- api key on message with expiry date  
- Only one at a time  
- Responds with a list of public databases

Description:
- Returns a list of all databases set to public
---

**action: getDatabases**  
Payload:
```json
{
    "apiKey": "string",
    "limit": "number",
    "offset": "number",
}
```
Response:  
- Responds with a list of owned and shared private databases

Description:
- Returns a list of all databases that a user owns
---

**action: createDatabase**  
Payload:
```json
{
    "apiKey": "string",
    "dbName": "string"
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Creates a new database
- Database names must be unique

---

**action: deleteDatabase**  
Payload:
```json
{
    "APIkey": "string",
    "dbID": "string"
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Deletes a database
---

**action: loadDatabase**  
Payload:
```json
{
    "apiKey": "string",
    "dbID": "string"
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message  

Description:
- Loads a Database for management
- Once a database is loaded, no other user can access it until it's unloaded (probably by timeout, might need to reload on the rest API side)
---

**action: unloadDatabase**  
Payload:
```json
{
    "apiKey": "string",
    "dbID": "string"
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- unoads a Database for management
---

**action: manageDatabase**  
Payload:
```json
{
    "apiKey": "string",
    "DataBaseID": "string",
    "operation": "string", // Create, Read, Update, Delete, Add
    "collectionName": "string", // name of collection (table) to be updated/read/deleted
    "documentID": "string", // id of document (data entry) to be updated/read/deleted (Optional)
    "documentData": {} // data to be added/updated (Optional)
}
```
Operations:
- `Create` -> Adds a new collection to the database (basically a table)
- `Add` -> Adds documents (data) to a collection
- `Read` -> Reads a collection in the database
- `Update` -> Updates a document in a collection
- `Delete` -> Deletes a document or deletes a collection if documentID is null

Description:
- Acts as a unified endpoint for all CRUD and other user owned database operations
---

**action: shareDatabase**  
Payload:
```json
{
    "apiKey": "string",
    "userID": "string", // user we want to share with
    "databaseID": "string" //db we want to share
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Shares a database with another user
- Allows that user to access and read and or write the database
---

**action: unshareDatabase**  
Payload:
```json
{
    "apiKey": "string",
    "userID": "string" // user we want to unshare with
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Unshares a database with another user
---

**action: makeDatabasePublic**  
Payload:
```json
{
    "apiKey": "string",
    "dbID": "string" 
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Makes the db public
---

**action: makeDatabasePrivate**  
Payload:
```json
{
    "apiKey": "string",
    "dbID": "string" 
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Makes the db private