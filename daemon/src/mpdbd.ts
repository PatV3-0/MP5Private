import is_running from "./singleton.js"; 
import {Response, Request} from './ResponseRequestInterface';
import { AuthenticationHandler, AuthorizationHandler } from './Auth'; //Authentication: is the user who they say they //Authorization: can the user access the data

import * as fs from "fs";
import * as path from "path";
import * as net from "net";
import DatabaseManager from "./DatabaseManager";
import FileManager from "./FileManager";
import { error } from "console";
import { request } from "http";


export class Daemon{
    private port: number;
    private server: net.Server;
    private authenticationHandler = new AuthorizationHandler();
    private authorizationHandler = new AuthorizationHandler();

    constructor(port: number){
        this.port = port;
        this.server = net.createServer(this.handleConnection.bind(this));
    }

    public start(): void{

        if (is_running()) {
            console.error("Daemon is already running...");
            process.exit(1);
        } else {
            setInterval(() => console.log("Daemon running..."), 60000);

            this.server.listen(this.port, () => {
                console.log(`Daemon listening on port ${this.port}`);
              });
        }
        
    }

    private async handleConnection(socket: net.Socket): Promise<void>{
        console.log("Client connected");
        socket.on("data", async (data) =>  this.handleRequest(socket, data));
        socket.on("end", () => console.log("Client disconnected"));
    }

    private getDatabaseNameById(userId: string, databaseID: string): string | null {
        const fileManager = new FileManager();
        try {
            const userDatabases = fileManager.getDatabases(userId);
            console.log("DB in GETDBBYID");
            console.log(JSON.stringify(userDatabases, null, 2));
            console.log("DBID: " + databaseID);
            const database = userDatabases.find(db => db._id === Number(databaseID));
            console.log("DB");
            console.log(database);
            return database ? database.name : null;
        } catch (error) {
            console.error("Error fetching database name:", error);
            return null;
        }
    }

      
    public getUserID(username: string){
        const usersFilePath = path.join('databases', 'admin', 'users.json');

        try {
            const fileManager = new FileManager();
            const users = fileManager.readFile(usersFilePath);
            const user = users.find((u: any) => u.username === username);
            return user ? user._id : null;
        } catch (error) {
            console.error('Error fetching user ID for username "${username}":, error');
            return null;
        }
    }

  private async handleRequest(socket: net.Socket, data: Buffer): Promise<void> {
    try {

      let response: Response = { status: 0, message: "", data: null };
      const request: Request = JSON.parse(data.toString());
      const fileManager = new FileManager();

      switch (request.action) {
        // case "login":
        //   let authHandler = new AuthenticationHandler();
        //   if (!authHandler.getConnection()) {
        //     response = {
        //       status: 500,
        //       message: "Could not load users file",
        //       data: null,
        //     };
        //   }
        //   console.log(request.payload)
        //   if(authHandler.loginUser(request.payload)){
        //     console.log("Login success")
        //     response = {
        //         status: 200,
        //         message: "User login details correct",
        //         data: null,
        //       };
        //   }

        //   else{
        //     console.log("login not successful")
        //     response = {
        //         status: 400,
        //         message: "User login details incorrect",
        //         data: null,
        //       };
        //   }
        //   break;
        case "login":
        let authHandler = new AuthenticationHandler();
        if (!authHandler.getConnection()) {
            response = {
                status: 500,
                message: "Could not load users file",
                data: null,
            };
            break;
        }

        try {
            const loginSuccess = await authHandler.loginUser(request.payload); 

            if (loginSuccess) {
                console.log("Login success");
                response = {
                    status: 200,
                    message: "User login details correct",
                    data: { hashedPass: request.payload.password } 
                };
            } else {
                console.log("Login not successful");
                response = {
                    status: 400,
                    message: "User login details incorrect",
                    data: null,
                };
            }
        } catch (error) {
            console.error("Error during login:", error);
            response = {
                status: 500,
                message: "Internal server error",
                data: null,
            };
        }
        break;

        case "register":
            let authHandlerReg = new AuthenticationHandler();
            if(authHandlerReg.registerUser(request.payload)){
                response = {
                    status: 200,
                    message: "User Registered",
                    data: null,
                  };
            }
            
            else{
                response = {
                    status: 401,
                    message: "User Registeration Failed",
                    data: null,
                  };
            }
            break;

        case "getAPIkey":
            let apiReg = new AuthenticationHandler();

            let key = apiReg.generateAPIkey(request.payload);
            response = {
                status: 200,
                message: "JWT",
                data: key,
              };

            break;
        case "revokeAPIkey":
            break;
        case "updateUser":
            break;
        case "getPublicDatabases":
            try {
                const publicDatabases = fileManager.getPublicDatabases();
                sleep(2000);
                response = {
                    status: 200,
                    message: "Returned public databases",
                    data: publicDatabases,
                };
            } catch (error) {
                response = {
                    status: 400,
                    message: "Failed to retrieve public databases",
                    data: null,
                };
            }            break;
            case "getDatabases":
                try {
                    const jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                    if (!jwtToken) {
                        response = {
                            status: 409,
                            message: "JWT validation failed",
                            data: null,
                        };
                        break;
                    }
            
                    const userId = this.getUserID(jwtToken["username"]);
            
                    const fileManager = new FileManager();
                    const userDatabases = fileManager.getDatabases(userId);
            
                    response = {
                        status: 200,
                        message: "Returned databases",
                        data: userDatabases,
                    };
                } catch (error) {
                    console.error("Error fetching databases:", error);
                    response = {
                        status: 400,
                        message: "Failed to retrieve databases",
                        data: null,
                    };
                }
                break;
        case "createDatabase":   
            try {
                let jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }

                const userId = this.getUserID(jwtToken["username"]);
                const dbName = request.payload.dbName;

                if (!userId || !dbName) {
                    response = {
                        status: 400,
                        message: "Missing required fields (userID or dbName)",
                        data: null,
                    };
                    break;
                }

                const fileManager = new FileManager();
                let userDatabases: Database[] = [];
                try {
                    userDatabases = fileManager.getDatabases(userId);
                } catch (error) {
                   
                }

                const dbCount = userDatabases.length + 1; 
                const dbID = parseInt(`${userId}${dbCount.toString().padStart(3, '0')}`);

                const dbDir = path.join('databases', 'users', `${userId}`, dbName);
                const dbFilePath = path.join(dbDir, `${dbName}.json`);

                if (fs.existsSync(dbDir)) {
                    response = {
                        status: 400,
                        message: "Database directory already exists",
                        data: null,
                    };
                    break;
                }

                fs.mkdirSync(dbDir, { recursive: true });

                const newDatabase: Database = {
                    _id: dbID, 
                    name: dbName,
                    owner: userId,
                    isPublic: false, 
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    description: "", 
                    tags: [], 
                    collections: [],
                    permissions: {
                        read: [userId], 
                        write: [userId], 
                    },
                    loaded: false,
                };

                const dbManager = new DatabaseManager<Database>(dbFilePath);
                dbManager.create(newDatabase);

                response = {
                    status: 200,
                    message: "Database created successfully",
                    data: { databaseID: dbID },
                };
            } catch (error) {
                console.error("Error creating database:", error);
                response = {
                    status: 400,
                    message: "Failed to create database",
                    data: null,
                };
            }
            break;
        case "deleteDatabase":
            try {
                let jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }

                const userID = this.getUserID(jwtToken["username"]);
                const dbName = request.payload.dbName;
                console.log("ID:" + userID);
                console.log("DB:" + dbName);

                fileManager.deleteDatabase(userID, dbName);
                console.log("Deleted");
                response = {
                    status: 200,
                    message: "Deleted database",
                    data: null,
                };
            } catch (error) {
                response = {
                    status: 400,
                    message: "Failed to delete database",
                    data: null,
                };
            }
            break;
        case "manageDatabase":
            try {
                // Decode the JWT token to validate the request
                const jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }
        
                const userId = this.getUserID(jwtToken["username"]);
                const { databaseID, operation, collectionName, documentID, documentData } = request.payload;
        
                // Validate required fields
                if (!databaseID || !operation || !collectionName) {
                    response = {
                        status: 400,
                        message: "Missing required fields (databaseID, operation, or collectionName)",
                        data: null,
                    };
                    break;
                }
        
                // Get the database name using the helper function
                console.log("USERID:" + userId);
                console.log("DBID:" + databaseID);
                const databaseName = this.getDatabaseNameById(userId, databaseID);
                console.log("DBNAME:" + databaseName);
                if (!databaseName) {
                    response = {
                        status: 404,
                        message: `Database with ID "${databaseID}" not found`,
                        data: null,
                    };
                    break;
                }
        
                // Use FileManager to read the database metadata file
                const fileManager = new FileManager();
                const dbMetadataPath = path.join('databases', 'users', `${userId}`, databaseName, `${databaseName}.json`);
        
                let databaseMetadata;
                try {
                    databaseMetadata = fileManager.readFile(dbMetadataPath);
                } catch (error) {
                    console.error("Error reading database metadata file:", error);
                    response = {
                        status: 404,
                        message: `Database metadata not found for "${databaseName}"`,
                        data: null,
                    };
                    break;
                }
        
                // Ensure the metadata is in the expected format
                if (!Array.isArray(databaseMetadata) || databaseMetadata.length === 0) {
                    response = {
                        status: 404,
                        message: `Database metadata not found for "${databaseName}"`,
                        data: null,
                    };
                    break;
                }
        
                // Use the first entry in the metadata array
                const dbMetadata = databaseMetadata[0];
        
                // Construct the path to the collection file
                const collectionFilePath = path.join('databases', 'users', `${userId}`, databaseName, `${collectionName}.json`);
                const collectionManager = new DatabaseManager<any>(collectionFilePath);
                sleep(4000);
        
                switch (operation) {
                    case "Create":
                        // Check if the collection already exists
                        const collectionExists = dbMetadata.collections.some(col => col.name === collectionName);
                        if (collectionExists) {
                            response = {
                                status: 400,
                                message: `Collection "${collectionName}" already exists`,
                                data: null,
                            };
                            break;
                        }
        
                        // Generate the collection ID (current collection count + 1)
                        const collectionId = (dbMetadata.collections.length + 1).toString().padStart(6, '0');
        
                        // Create the collection object
                        const newCollection = {
                            _id: collectionId,
                            name: collectionName,
                            documents: [],
                        };
        
                        // Add the collection to the database metadata
                        dbMetadata.collections.push(newCollection);
                        fileManager.updateFile(dbMetadataPath, [dbMetadata]);
        
                        // Create the collection file using DatabaseManager
                        collectionManager.create(newCollection);
        
                        response = {
                            status: 200,
                            message: `Created collection "${collectionName}"`,
                            data: null,
                        };
                        break;
                        // Read the collection
                    case "Add":
                        try {
                            // Read the collection file using FileManager
                            let collection;
                            try {
                                collection = fileManager.readFile(collectionFilePath);
                            } catch (error) {
                                console.error("Error reading collection file:", error);
                                response = {
                                    status: 404,
                                    message: `Collection "${collectionName}" not found`,
                                    data: null,
                                };
                                break;
                            }
                    
                            //find collections
                            let index = 0;
                            let found = false;

                            for(let i = 0; i < collection.length; i++){
                                if(collectionName == collection[i].name){
                                    found = true;
                                    index = i;
                                }
                            }
                            
                            if(found == false){
                                response = {
                                    status: 400,
                                    message: `Invalid Collection name`,
                                    data: null,
                                };
                                break;
                            }

                            if (!Array.isArray(collection[index].documents)) {
                                response = {
                                    status: 400,
                                    message: `Invalid collection format: missing "documents" array`,
                                    data: null,
                                };
                                break;
                            }
                    
                            // Validate that the documentData includes a "name" field
                            if (!documentData || !documentData.name) {
                                response = {
                                    status: 400,
                                    message: "Document data must include a 'name' field",
                                    data: null,
                                };
                                break;
                            }

                            //check dupes
                            let dupe = false;
                            for(let i = 0; i < collection[index].documents.length; i++){
                                if(documentData.name == collection[index].documents[i].name){
                                    dupe = true;
                                }
                            }

                            if(dupe){
                                response = {
                                    status: 400,
                                    message: `Document name already used`,
                                    data: null,
                                };
                                break;
                            }
                    
                            // Generate the document ID (current document count + 1)
                            const documentId = (collection[index].documents.length + 1).toString().padStart(6, '0');
                    
                            // Create the document object
                            const newDocument = {
                                _id: documentId,
                                name: documentData.name, // Use the provided name
                                ...documentData, // Include other fields from documentData
                            };
                    
                            // Add the document to the collection
                            collection[index].documents.push(newDocument);
                    
                            // Update the collection file using FileManager
                            fileManager.updateFile(collectionFilePath, collection);
                    
                            response = {
                                status: 200,
                                message: `Added document to collection "${collectionName}"`,
                                data: null,
                            };
                        } catch (error) {
                            console.error("Error adding document:", error);
                            response = {
                                status: 400,
                                message: `Failed to add document to collection "${collectionName}"`,
                                data: null,
                            };
                        }
                        break;

                        case "Update":
                            try {
                                // Read the collection file using FileManager
                                let collection;
                                try {
                                    collection = fileManager.readFile(collectionFilePath);
                                } catch (error) {
                                    console.error("Error reading collection file:", error);
                                    response = {
                                        status: 404,
                                        message: `Collection "${collectionName}" not found`,
                                        data: null,
                                    };
                                    break;
                                }
                        
                                // Find the collection by name
                                let index = 0;
                                let found = false;
                        
                                for (let i = 0; i < collection.length; i++) {
                                    if (collectionName === collection[i].name) {
                                        found = true;
                                        index = i;
                                        break;
                                    }
                                }
                        
                                if (!found) {
                                    response = {
                                        status: 400,
                                        message: `Invalid Collection name`,
                                        data: null,
                                    };
                                    break;
                                }
                        
                                // Ensure the collection has a "documents" array
                                if (!Array.isArray(collection[index].documents)) {
                                    response = {
                                        status: 400,
                                        message: `Invalid collection format: missing "documents" array`,
                                        data: null,
                                    };
                                    break;
                                }
                        
                                // Validate that the document ID is provided
                                if (!documentID) {
                                    response = {
                                        status: 400,
                                        message: "Document ID is required for update operation",
                                        data: null,
                                    };
                                    break;
                                }
                        
                                // Convert documentID to a number (since IDs are successive)
                                const docIdNumber = parseInt(documentID, 10);
                        
                                // Check if the document ID is valid
                                if (isNaN(docIdNumber)) {
                                    response = {
                                        status: 400,
                                        message: `Invalid document ID: "${documentID}"`,
                                        data: null,
                                    };
                                    break;
                                }
                        
                                // Check if the document ID is within the valid range
                                if (docIdNumber < 1 || docIdNumber > collection[index].documents.length) {
                                    response = {
                                        status: 404,
                                        message: `Document with ID "${documentID}" not found`,
                                        data: null,
                                    };
                                    break;
                                }
                        
                                // Get the document by its index (documentID - 1 since IDs start at 1)
                                const documentIndex = docIdNumber - 1;
                                const document = collection[index].documents[documentIndex];
                        
                                // Update the document with the provided key-value pairs
                                for (const [key, value] of Object.entries(documentData)) {
                                    if (key !== "_id" && key !== "name") { // Prevent updating _id or name
                                        document[key] = value;
                                    }
                                }
                        
                                // Update the collection file using FileManager
                                fileManager.updateFile(collectionFilePath, collection);
                        
                                response = {
                                    status: 200,
                                    message: `Updated document in collection "${collectionName}"`,
                                    data: document, // Return the updated document
                                };
                            } catch (error) {
                                console.error("Error updating document:", error);
                                response = {
                                    status: 400,
                                    message: `Failed to update document in collection "${collectionName}"`,
                                    data: null,
                                };
                            }
                            break;
                        
                }
            } catch (error) {
                console.error("Error managing database:", error);
                response = {
                    status: 400,
                    message: "Failed to process database operation",
                    data: null,
                };
            }
            break;
        // Add these cases to the switch statement in handleRequest

        case "loadDatabase":
            try {
                const jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }

                const userId = this.getUserID(jwtToken["username"]);
                console.log(userId)
                const { databaseID } = request.payload;

                if (!databaseID) {
                    response = {
                        status: 400,
                        message: "Missing required field: databaseID",
                        data: null,
                    };
                    break;
                }

                const databaseName = this.getDatabaseNameById(userId, databaseID);
                if (!databaseName) {
                    response = {
                        status: 404,
                        message: `Database with ID "${databaseID}" not found`,
                        data: null,
                    };
                    break;
                }

                const dbMetadataPath = path.join('databases', 'users', `${userId}`, databaseName, `${databaseName}.json`);
                const fileManager = new FileManager();
                const databaseMetadata = fileManager.readFile(dbMetadataPath);

                if (!Array.isArray(databaseMetadata) || databaseMetadata.length === 0) {
                    response = {
                        status: 404,
                        message: `Database metadata not found for "${databaseName}"`,
                        data: null,
                    };
                    break;
                }

                const dbMetadata = databaseMetadata[0];
                dbMetadata.loaded = true;
                fileManager.updateFile(dbMetadataPath, [dbMetadata]);

                response = {
                    status: 200,
                    message: `Database "${databaseName}" loaded successfully`,
                    data: null,
                };
            } catch (error) {
                console.error("Error loading database:", error);
                response = {
                    status: 400,
                    message: "Failed to load database",
                    data: null,
                };
            }
            break;

        case "unloadDatabase":
            try {
                const jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }

                const userId = this.getUserID(jwtToken["username"]);
                const { databaseID } = request.payload;

                if (!databaseID) {
                    response = {
                        status: 400,
                        message: "Missing required field: databaseID",
                        data: null,
                    };
                    break;
                }

                const databaseName = this.getDatabaseNameById(userId, databaseID);
                if (!databaseName) {
                    response = {
                        status: 404,
                        message: `Database with ID "${databaseID}" not found`,
                        data: null,
                    };
                    break;
                }

                const dbMetadataPath = path.join('databases', 'users', `${userId}`, databaseName, `${databaseName}.json`);
                const fileManager = new FileManager();
                const databaseMetadata = fileManager.readFile(dbMetadataPath);

                if (!Array.isArray(databaseMetadata) || databaseMetadata.length === 0) {
                    response = {
                        status: 404,
                        message: `Database metadata not found for "${databaseName}"`,
                        data: null,
                    };
                    break;
                }

                const dbMetadata = databaseMetadata[0];
                dbMetadata.loaded = false;
                fileManager.updateFile(dbMetadataPath, [dbMetadata]);

                response = {
                    status: 200,
                    message: `Database "${databaseName}" unloaded successfully`,
                    data: null,
                };
            } catch (error) {
                console.error("Error unloading database:", error);
                response = {
                    status: 400,
                    message: "Failed to unload database",
                    data: null,
                };
            }
            break;

        case "shareDatabase":
            try {
                const jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }

                const userId = this.getUserID(jwtToken["username"]);
                const { databaseID, targetUsername, permissionType } = request.payload;

                if (!databaseID || !targetUsername || !permissionType) {
                    response = {
                        status: 400,
                        message: "Missing required fields (databaseID, targetUsername, or permissionType)",
                        data: null,
                    };
                    break;
                }

                if (permissionType !== "read" && permissionType !== "write") {
                    response = {
                        status: 400,
                        message: "Invalid permission type (must be 'read' or 'write')",
                        data: null,
                    };
                    break;
                }

                const targetUserId = this.getUserID(targetUsername);
                if (!targetUserId) {
                    response = {
                        status: 404,
                        message: `Target user "${targetUsername}" not found`,
                        data: null,
                    };
                    break;
                }

                const databaseName = this.getDatabaseNameById(userId, databaseID);
                if (!databaseName) {
                    response = {
                        status: 404,
                        message: `Database with ID "${databaseID}" not found`,
                        data: null,
                    };
                    break;
                }

                const dbMetadataPath = path.join('databases', 'users', `${userId}`, databaseName, `${databaseName}.json`);
                const fileManager = new FileManager();
                const databaseMetadata = fileManager.readFile(dbMetadataPath);

                if (!Array.isArray(databaseMetadata) || databaseMetadata.length === 0) {
                    response = {
                        status: 404,
                        message: `Database metadata not found for "${databaseName}"`,
                        data: null,
                    };
                    break;
                }

                const dbMetadata = databaseMetadata[0];

                // Check if user already has permissions
                if (dbMetadata.permissions[permissionType].includes(targetUserId)) {
                    response = {
                        status: 400,
                        message: `User "${targetUsername}" already has ${permissionType} permissions`,
                        data: null,
                    };
                    break;
                }

                // Add user to permissions
                dbMetadata.permissions[permissionType].push(targetUserId);
                fileManager.updateFile(dbMetadataPath, [dbMetadata]);

                response = {
                    status: 200,
                    message: `Successfully shared database with ${targetUsername} (${permissionType} permissions)`,
                    data: null,
                };
            } catch (error) {
                console.error("Error sharing database:", error);
                response = {
                    status: 400,
                    message: "Failed to share database",
                    data: null,
                };
            }
            break;

        case "unshareDatabase":
            try {
                const jwtToken = this.authorizationHandler.decodeJWT(request.payload);
                if (!jwtToken) {
                    response = {
                        status: 409,
                        message: "JWT validation failed",
                        data: null,
                    };
                    break;
                }

                const userId = this.getUserID(jwtToken["username"]);
                const { databaseID, targetUsername, permissionType } = request.payload;

                if (!databaseID || !targetUsername || !permissionType) {
                    response = {
                        status: 400,
                        message: "Missing required fields (databaseID, targetUsername, or permissionType)",
                        data: null,
                    };
                    break;
                }

                if (permissionType !== "read" && permissionType !== "write") {
                    response = {
                        status: 400,
                        message: "Invalid permission type (must be 'read' or 'write')",
                        data: null,
                    };
                    break;
                }

                const targetUserId = this.getUserID(targetUsername);
                if (!targetUserId) {
                    response = {
                        status: 404,
                        message: `Target user "${targetUsername}" not found`,
                        data: null,
                    };
                    break;
                }

                const databaseName = this.getDatabaseNameById(userId, databaseID);
                if (!databaseName) {
                    response = {
                        status: 404,
                        message: `Database with ID "${databaseID}" not found`,
                        data: null,
                    };
                    break;
                }

                const dbMetadataPath = path.join('databases', 'users', `${userId}`, databaseName, `${databaseName}.json`);
                const fileManager = new FileManager();
                const databaseMetadata = fileManager.readFile(dbMetadataPath);

                if (!Array.isArray(databaseMetadata) || databaseMetadata.length === 0) {
                    response = {
                        status: 404,
                        message: `Database metadata not found for "${databaseName}"`,
                        data: null,
                    };
                    break;
                }

                const dbMetadata = databaseMetadata[0];

                // Check if user has permissions to remove
                const permissionIndex = dbMetadata.permissions[permissionType].indexOf(targetUserId);
                if (permissionIndex === -1) {
                    response = {
                        status: 400,
                        message: `User "${targetUsername}" doesn't have ${permissionType} permissions`,
                        data: null,
                    };
                    break;
                }

                // Remove user from permissions
                dbMetadata.permissions[permissionType].splice(permissionIndex, 1);
                fileManager.updateFile(dbMetadataPath, [dbMetadata]);

                response = {
                    status: 200,
                    message: `Successfully revoked ${permissionType} permissions from ${targetUsername}`,
                    data: null,
                };
            } catch (error) {
                console.error("Error unsharing database:", error);
                response = {
                    status: 400,
                    message: "Failed to unshare database",
                    data: null,
                };
            }
            break;
        default:
            response = { status: 401, message: "Invalid Request", data: null };

//===============================================================================================================================================
//TESTING PURPOSES, WILL BE REMOVED
        case "verifyJWT":
            let jwtver = new AuthorizationHandler();

            let decodeKey = jwtver.verifyJWTIntegrity(request.payload);

            if(decodeKey){
                response = {
                    status: 200,
                    message: "JWT verfied",
                    data: null
                  };
            }

            else{
                response = {
                    status: 400,
                    message: "JWT invalid",
                    data: null
                  };
            }
            break;
        
        case "isAdmin":
            let jwtadmin = new AuthorizationHandler();
            jwtadmin.isAdmin(request.payload)
            break

        case "test":
            console.log("Test Point")
            response = { status: 727, message: "Toast", data: [0,1,2,3] };
            break;
      }

//===============================================================================================================================================
      socket.write(JSON.stringify(response));

    } catch (error) {
      console.error("Error processing request:", error);
      socket.write(JSON.stringify({ error: "Invalid request format" }));
    }
  }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const PORT = 5000;
const daemon = new Daemon(PORT);
daemon.start();



interface Database {
    _id: number; 
    name: string;
    owner: string; 
    isPublic: boolean;
    createdAt: string;
    updatedAt: string; 
    description: string;
    tags: string[];
    collections: Array<{
        _id: string;
        name: string;
        documents?: Array<{
            _id: string;
            name: string;
            [key: string]: any;
        }>;
    }>;
    permissions: { 
        read: string[], 
        write: string[]
    };
    loaded: boolean;
}