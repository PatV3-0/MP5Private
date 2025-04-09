# Daemon 

## Pre-requisites
- nodejs
- npm

## Run Commands:
- npm add --save-dev @types/node
- npm i -D tsx
- npm install jsonwebtoken
- npm install bcrypt

## Secret Token
- Make sure you have the MP5_SECRET_TOKEN set in your envirronment (see pinned message in the dameon channel on discord)

## Starting the daemon
Run:
    `npx tsx mpdbd.ts`
to start the daemon



## Daemon Specifification

### Folders:
- Databases are stored in the database folder.
- Within this we have admin and user folder
- The admin folder consists of the users.json file which stores information on all mpdb users and follows the User Template defined below.
- The users folder consists of user owned databases and follow this format: 
    - databases/user_id/db_name/collection_name.json
    - Each collection file can hold documents which is user defined data
    - Each document has a unique ID and user given name which must be unique to that collection
    - collection_name.json format:
```json
[
        {
            "_id": "string",
            "name": "string",
            "owner name": "string",
            "owner _id": "string",
            "description": "string",
            "collection": 
                {
                    "_id": "string",
                    "name": "string",
                    "documents": [
                        {
                            "_id": "string",
                            "some user made thing" : "user made vlaue",
                            "some user made thing2" : "user made vlaue2",
                            ...
                        },
                        {
                            "_id": "string",
                            "some user made thing" : "user made vlaue",
                            "some user made thing2" : "user made vlaue2",
                        }, ...
                    ]
                },
             {
                "_id": "string",
                "name": "string",
                "documents": [...]
            ...
            },
        ...
        }
    ]
```

## Requests and Responses
- Requets must be in the format as defined in "ResponseRequestInterface.ts"
- Respones will be in a JSON encoded format as defined in "ResponseRequestInterface.ts"

## Data Templates

### User Template
```json
[
    {
    "_id": "string",
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
    },
    "loaded": "boolean"
  }
]
```
## Request Types

### Login
```json
{
"action": "login",
"payload":
    {
    "username": "string",
    "password": "string"
    }
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

### Register
```json
{
"action": "register",
"payload":
    {
    "username": "string",
    "name": "string",
    "surname": "string",
    "email": "string",
    "password": "string hased password",
    "profileImage": "string url", //Optional
    }
}
```
Response:  
- `status = 200` if successful  
- `status = 400` if not with a message

Description:
- Add's a new user to the users.json file
- Username must be unique 

---

### Get API Key
```json
{
"action": "getAPIkey",
"payload":
    {
        "username": "string",
        "password": "string",
        "email" : "string"
    }
}
```
Response:  
- `status = 200` if successful  
- api key in the data field

Description:
- Generates a JWT token 
- The user is responsible for ensuring the safety of their token
- JWT tokens will be used to authorize operations
- JWT tokens expire after x amount (timeout time TBA)
- A user can only have a single JWT token at a time
---


### Revoke API Key
**ON HOLD**
```json
"action": "revokeAPIkey",
"payload":
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
### Update User
```json
"action": "updateUser",
"payload":
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
- JWT needs to be owned by the user or have the admin field set
---

### Get Public Databases
```json
"action": "getPublicDatabases",
"payload":
    {
        "limit": "number",
        "offset": "number"
    }
```
Response:  
- `status = 200` if successful  
- Responds with a list of public databases

Data response format:
```json
    [
        {
            "_id": "string",
            "name": "string",
            "owner name": "string",
            "owner _id": "string",
            "description": "string",
            "collection": 
                {
                    "_id": "string",
                    "name": "string",
                    "documents": [
                        {
                            "_id": "string",
                            "some user made thing" : "user made vlaue",
                            "some user made thing2" : "user made vlaue2",
                            ...
                        },
                        {
                            "_id": "string",
                            "some user made thing" : "user made vlaue",
                            "some user made thing2" : "user made vlaue2",
                        }, ...
                    ]
                },
             {
                "_id": "string",
                "name": "string",
                "documents": [...]
            ...
            },
        ...
        }
    ]
```

Description:
- Returns a list of all databases set to public
---

### Get Databases owned by user
```json
"action": "getDatabases",
"payload":
{
    "apiKey": "string",
}
```
Response:  
- `status = 200` if successful 
-  `status = 404` if not 
- data has a json object of databases

Description:
- Returns a list of all databases that a user owns or has been added to

Data response format:
```json
    [
        {
            "_id": "string",
            "name": "string",
            "owner name": "string",
            "owner _id": "string",
            "description": "string",
            "collection": 
                {
                    "_id": "string",
                    "name": "string",
                    "documents": [
                        {
                            "_id": "string",
                            "some user made thing" : "user made vlaue",
                            "some user made thing2" : "user made vlaue2",
                            ...
                        },
                        {
                            "_id": "string",
                            "some user made thing" : "user made vlaue",
                            "some user made thing2" : "user made vlaue2",
                        }, ...
                    ]
                },
             {
                "_id": "string",
                "name": "string",
                "documents": [...]
            ...
            },
        ...
        }
    ]
```
---

### Create Database
```json
"action": "createDatabase",
"payload":
    {
        "apiKey": "string",
        "dbName": "string"
    }
```
Response:  
- `status = 200` if successful
    - data field with have new database ID
- `status = 400` if not with a message

Description:
- Creates a new database
- Gets user ID from api key
- Database names must be unique
---

### Delete Database
Payload:
```json
"action": "deleteDatabase",
"payload": 
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

### Load Database
**ON HOLD**
```json
"action": "loadDatabase",
"payload":
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

### Unload Database
**ON HOLD**
```json
"action": "unlcoadDatabase",
"payload":
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

### Database Management
```json
"action": "manageDatabase",
"payload":
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
- **NB**: You need to first use the "getDatabases" endpoint to get the collections and their ids
- `Create` -> Adds a new collection to the database (basically a table)
- `Add` -> Adds documents (data) to a collection (Key:Value)
- `Read` -> Reads a collection in the database
- `Update` -> Updates a document in a collection (Key:Value to update to)
- `Delete` -> Deletes a document or deletes a collection if documentID is null

Description:
- Acts as a unified endpoint for all CRUD and other user owned database operations
- Works at the collection/table level

Format for Create operation:
```json
"action": "manageDatabase",
"payload":
    {
        "apiKey": "string",
        "DataBaseID": "string",
        "operation": "Create",
        "collectionName": "new colleciton name", // name of collection (table) to be updated/read/deleted
        "documentID": "null", 
        "documentData": "null // initial data to be added (Optional)
    }

```

Format for Add operation:
```json
"action": "manageDatabase",
"payload":
    {
        "apiKey": "string",
        "DataBaseID": "string",
        "operation": "Add"/"Update",
        "collectionName": "existing colleciton name", // name of collection (table) to be updated/read/deleted
        "documentID": "_id of document", 
        "documentData": {"key1":"value1", "key2":"value2"} // data to be added/updated
    }
```
---

**action: shareDatabase**  
**ON HOLD**
```json
"action": "shareDatabase",
"payload":
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
```json
"action": "unshareDatabase",
"payload": 
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

## Daemon Technical
- JWT used for token
- 
