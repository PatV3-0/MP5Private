/**
 * @fileoverview REST API server implementation for the MPDB database system.
 * Handles HTTP requests and communicates with the MPDB daemon.
 * @author MP5
 */

import express from "express";
import net from "net";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: 'config.env' });

/**
 * Import authentication utilities for password hashing and verification
 * @requires auth
 */
import { hashPassword, verifyPassword } from "./auth.js";


/**
 * Import API key generation utility
 * @requires APIauth
 */import { generateApiKey } from "./APIauth.js";
// const { generateApiKey } = require("../../js-lib/src/APIauth.js");


/** @const {number} PORT - REST API server port */
const PORT = process.env.PORT || 3000;

/** @const {number} DAEMON_PORT - MPDB daemon port */
const DAEMON_PORT = 5000;

/** @const {string} DAEMON_HOST - MPDB daemon host address */
const DAEMON_HOST = "127.0.0.1";



/**
 * Sends a request to the MPDB daemon and returns the response
 * @param {Object} requestData - The request data to send to the daemon
 * @param {string} requestData.action - The action to perform
 * @param {Object} requestData.payload - The payload containing request parameters
 * @returns {Promise<Object>} The daemon's response
 * @throws {Error} When daemon communication fails or times out
 * @example
 * const response = await sendToDaemon({
 *   action: "login",
 *   payload: { username: "user1", password: "pass123" }
 * });
 */
export const sendToDaemon = (requestData) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();  // Create a TCP client socket to send requests and receive responses from mpdbd (DAEMON)

        //adding a timeout, so user does not wait forever
        const timeout =setTimeout (()=>{
            client.destroy();
            reject(new Error("Daemon response timeout."));
        } , 10000); // will give the daemon 10 seconds to respond

        // 1️. Connect to the daemon
        client.connect(DAEMON_PORT, DAEMON_HOST, () => {
            client.write(JSON.stringify(requestData));  // 2. Send JSON request to daemon
        });

        // 3. Listen for the response from daemon, when response received, triggers data event
        client.on("data", (data) => {
            clearTimeout(timeout);
            resolve(JSON.parse(data.toString()));  // 4. Resolve the promise with the response AND parse the JSON response
            client.destroy();  // 5. Close the connection after receiving data
        });

        // 6. Handle errors
        client.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);

        });
    });
}


// REST ENDPOINTS


/**
 * Creates and configures the Express application with all routes
 * @param {Function} sendToDaemon - Function to communicate with the daemon
 * @returns {express.Application} Configured Express application
 */
export const createApp = (sendToDaemon) =>{
    const app = express();
    app.use(express.json());
    app.use(cors());

    /**
     * Register a new user
     * @route POST /register
     * @param {Object} req.body.payload - Registration data
     * @param {string} req.body.payload.username - User's username
     * @param {string} req.body.payload.password - User's password
     * @param {string} req.body.payload.email - User's email
     * @param {string} req.body.payload.name - User's first name
     * @param {string} req.body.payload.surname - User's last name
     * @param {string} [req.body.payload.profileImage] - Optional profile image
     * @returns {Promise<Object>} Registration response
     */

    app.post("/register", async (req, res) => {
        const { username, name, surname, email, password, profileImage } = req.body.payload; // Extract data from payload

        try {
            // Hash the password
            // const hashedPass = await hashPassword(password);
            // console.log("Hashed password reg poes:", hashedPass);

            // Prepare the payload for the daemon
            const payload = {
                username,
                name,
                surname,
                email,
                password: password,
                profileImage: profileImage || null //optional 
            };

            // Send the payload to the daemon
            const response = await sendToDaemon({
                action: "register",
                payload: payload
            });

            // Send the response back to the client
            res.status(200).json(response);
        } catch (error) {
            console.error("Registration error:", error);
            res.status(400).json({
                error: "User registration failed, please try again."
            });
        }
    });

    /**
     * Authenticate a user
     * @route POST /login
     * @param {Object} req.body.payload - Login credentials
     * @param {string} req.body.payload.username - User's username
     * @param {string} req.body.payload.password - User's password
     * @returns {Promise<Object>} Login response
     */

    app.post("/login", async (req, res) => {
        // Get the username and password from the payload
        let { username, password } = req.body.payload || {};
      
        if (!username || !password) {
          return res.status(400).json({
            error: "Username or password is missing in the request body.",
          });
        }
        // password = await hashPassword(password);
        // console.log("Hashed password poes:", password);

        try {
          // Send login request to daemon with plaintext password
          const response = await sendToDaemon({
            action: "login",
            payload: { username, password },
          });
      
          if (!response) {
            console.error("sendToDaemon() returned undefined!");
            return res.status(500).json({
              error: "Internal server error: No response from daemon.",
            });
          }
      
          // Check daemon response
          if (response.status === 200) {
            return res.json({
              message: "You have successfully logged in!",
              data: response.data, 
            });
          } else {
            return res.status(401).json({
              error: "User login details incorrect.",
            });
          }
        } catch (error) {
          console.error("Login error:", error);
          return res.status(500).json({
            error: "Failed to communicate with the daemon.",
          });
        }
      });

    // app.post("/login", async (req, res) => {
    //     const {username , password} = req.body;

    //     console.log("Received hashed password from daemon:", response.payload.hashedPass);
    //     console.log("Entered password:", password);

    //     try{
    //         const response = await sendToDaemon({
    //             action: "login", payload: {username , password}
    //         });


    //         if (response.status == 200){
    //             // const match = await bcrypt.compare(password , response.payload.hashedPass);
    //             const match = await verifyPassword(password , response.payload.hashedPass); 

    //             if (match == true){
    //                 res.json({
    //                     message: "You have successfully logged in!"
    //                 })
    //             }else{
    //                 res.status(400).json({
    //                     error:"Login failed, please ensure you have inserted the correct information."
    //                 })
    //             }

    //         }else{
    //             res.status(400).json({
    //                 error:"User was not found, ensure correct credentials were inserted." 
    //             })
    //         }
    //     }catch(error){
    //         console.error("Login error:", error);
    //         res.status(500).json({
    //             error: "Failed to communicate with the daemon"
    //         })
    //     }
    // });

    /**
     * Generate an API key for a user
     * @route POST /getAPIKey
     * @param {Object} req.body.payload - API key request data
     * @param {string} req.body.payload.username - User's username
     * @param {string} req.body.payload.password - User's password
     * @param {string} req.body.payload.email - User's email
     * @returns {Promise<Object>} API key response
     */
    
    app.post('/getAPIKey', async (req, res) => {
      // Expecting payload with _id, username, and email
      const { username, password, email } = req.body.payload;
      // print out
        console.log(req.body.payload);
        console.log(username);
        console.log(password);
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing fields required for generating API key" });
      }
      try {
        const response = await sendToDaemon({
          action: "getAPIkey",
          payload: { username, password, email }
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: "Failed to communicate with daemon" });
      }
    });
    

      /**
     * Revoke an existing API key
     * @route POST /revokeAPIKey
     * @param {Object} req.body - Revocation request data
     * @param {string} req.body.username - User's username
     * @param {string} req.body.password - User's password
     * @param {string} req.body.api_key - API key to revoke
     * @returns {Promise<Object>} Revocation response
     */

    app.post("/revokeAPIKey", async (req, res) => {

        const {username , password , api_key} = req.body;

        try{
            // const response = await sendToDaemon({
            //     action: "login" , payload: {username}
            // });

            const response = await sendToDaemon({
                action: "revokeAPIkey" , payload: {username , password, api_key}
            });

            if (response.status == 200){
                res.json({
                    status: 200 , message : "API key has been revoked successfully."
                });
            }else{
                res.status(response.status).json({
                    error: response.message
                });
            }

        }catch(error){
            console.error("There has been an error: " , error);
            res.status(500).json({
                error:"Failed to revoke the API key, Daemon communication failed."
            })
        }

    });

    /**
     * Update user information
     * @route PUT /updateUser
     * @param {Object} req.body.payload - User update data
     * @param {string} req.body.payload.apiKey - User's API key
     * @param {string} req.body.payload.userID - User's ID
     * @param {Object} req.body.payload.userData - Updated user data
     * @returns {Promise<Object>} Update response
     */
    
    app.put("/updateUser", async (req, res) => {
        const updatedUser = req.body.payload;
    
        //Check if json body is missing or empty 
        if(!updatedUser || Object.keys(updatedUser).length === 0)
        {
            return res.status(400).send({
                status: 'HTTP/1.1 400 Bad Request',
                message: 'JSON body empty'
            });
        }
        //Check if required fields are there
        //May have to add api-key array
        if(!updatedUser.apiKey || !updatedUser.userID || !updatedUser.userData)
        {
            return res.status(400).send({
                status: 'HTTP/1.1 400 Bad Request',
                message: 'apiKey or userID or userData is missing'
            });
        }
    
        //Make request to api
        try{
            const response = await sendToDaemon({
                action: "updateUser",
                payload: {apikKey: updatedUser.apiKey, userID: updatedUser.userID, userData: updatedUser.userData}
            });
            res.status(200).send(response);
        }
        catch(error)
        {
            res.status(500).json({ error: "Failed to communicate with daemon" });
        }
    });


    /**
     * Get public databases with pagination
     * @route POST /getPublicDatabases
     * @param {Object} req.body.payload - Pagination parameters
     * @param {number} req.body.payload.limit - Number of items per page
     * @param {number} req.body.payload.offset - Number of items to skip
     * @returns {Promise<Object>} List of public databases
     */

    app.post("/getPublicDatabases", async (req, res) => {
        const {limit, offset} = req.body.payload;
        if(limit === undefined || offset === undefined || limit < 0 || offset < 0)
        {
            return res.status(400).send({
                status: 'HTTP/1.1 400 Bad Request',
                message: 'limit or offset missing'
            })
        }
    
        //send request to daemon
        try{
            const response = await sendToDaemon({
                action: "getPublicDatabases",
                payload: {limit: limit, offset: offset }
            });
            res.status(200).json(response);
        }
        catch(error)
        {
            res.status(500).json({ error: "Failed to communicate with daemon" });
        }
    });


    /**
     * Get user's owned and shared databases
     * @route POST /getDatabases
     * @param {Object} req.body.payload - Request data
     * @param {string} req.body.payload.apiKey - User's API key
     * @returns {Promise<Object>} List of databases
     */

    app.post("/getDatabases", async (req, res) => {
        const databases = req.body.payload;

        if(!databases || Object.keys(databases).length === 0)  
        {
            return res.status(400).send({
                status: 'HTTP/1.1 400 Bad Request',
                message: 'JSON body empty'
            });
        }

        if(!databases.apiKey)
        {
            return res.status(400).send({
                status: 'HTTP/1.1 400 Bad Request',
                message: 'apiKey missing'
            });
        }

        //send request to daemon
        try{
            const response = await sendToDaemon({
                action: "getDatabases",
                payload: { apiKey: databases.apiKey }
            });
            res.status(200).json(response);
        }
        catch(error)
        {
            res.status(500).json({ error: "Failed to communicate with daemon" });
        }
    });

    /**
     * Create a new database
     * @route POST /createDatabase
     * @param {Object} req.body.payload - Database creation data
     * @param {string} req.body.payload.dbName - Name of the database
     * @param {string} req.body.payload.apiKey - User's API key
     * @returns {Promise<Object>} Creation response
     */    
    
    app.post('/createDatabase', async (req, res) => {
      // Expecting payload with dbName and jwtToken (or similar) for authentication
      const { dbName, apiKey } = req.body.payload;
      console.log(req.body.payload);
      console.log(dbName);
        console.log(apiKey);
      if (!dbName || !apiKey) {
        return res.status(400).json({ message: "Database name and JWT token are required" });
      }
      try {
        const response = await sendToDaemon({
          action: "createDatabase",
          payload: { dbName, apiKey }
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: "Failed to communicate with daemon" });
      }
    });


    /**
     * Delete an existing database
     * @route POST /deleteDatabase
     * @param {Object} req.body.payload - Database deletion data
     * @param {string} req.body.payload.dbName - Name of the database
     * @param {string} req.body.payload.apiKey - User's API key
     * @returns {Promise<Object>} Deletion response
     */

    app.post('/deleteDatabase', async (req, res) => {
        // Expecting payload with dbName and jwtToken (or similar) for authentication
        const { dbName, apiKey } = req.body.payload;
        console.log(req.body.payload);
        console.log(dbName);
          console.log(apiKey);
        if (!dbName || !apiKey) {
          return res.status(400).json({ message: "Database name and JWT token are required" });
        }
        try {
          const response = await sendToDaemon({
            action: "deleteDatabase",
            payload: { dbName, apiKey }
          });
          res.json(response);
        } catch (error) {
          res.status(500).json({ error: "Failed to communicate with daemon" });
        }
      });


    /**
     * Load a database into memory
     * @route POST /loadDatabase
     * @param {Object} req.body.payload - Database load request
     * @param {string} req.body.payload.databaseID - Database identifier
     * @param {string} req.body.payload.jwtToken - Authentication token
     * @returns {Promise<Object>} Load response
     */

    app.post('/loadDatabase', async (req, res) => {
      const { databaseID, jwtToken } = req.body.payload;
      if (!databaseID || !jwtToken) {
        return res.status(400).json({ message: "Database ID and JWT token are required" });
      }
      try {
        const response = await sendToDaemon({
          action: "loadDatabase",
          payload: { databaseID, jwtToken }
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: "Failed to communicate with daemon" });
      }
    });

    app.post('/getUser', async (req, res) => {
      const { apiKey } = req.body.payload;
      if (!apiKey) {
        return res.status(400).json({ message: "apiKey is required" });
      }
      try {
        const response = await sendToDaemon({
          action: "getUser",
          payload: { apiKey }
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: "Failed to communicate with daemon" });
      }
    });


    /**
     * Unload a database from memory
     * @route POST /unloadDatabase
     * @param {Object} req.body.payload - Database unload request
     * @param {string} req.body.payload.databaseID - Database identifier
     * @param {string} req.body.payload.jwtToken - Authentication token
     * @returns {Promise<Object>} Unload response
     */                 

    app.post('/unloadDatabase', async (req, res) => {
      const { databaseID, jwtToken } = req.body.payload;
      if (!databaseID || !jwtToken) {
        return res.status(400).json({ message: "Database ID and JWT token are required" });
      }
      try {
        const response = await sendToDaemon({
          action: "unloadDatabase",
          payload: { databaseID, jwtToken }
        });
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: "Failed to communicate with daemon" });
      }
    });


      /**
     * Manage database operations (CRUD)
     * @route POST /manageDatabase
     * @param {Object} req.body.payload - Database management request
     * @param {string} req.body.payload.apiKey - User's API key
     * @param {string} req.body.payload.databaseID - Database identifier
     * @param {string} req.body.payload.operation - Operation to perform
     * @param {string} req.body.payload.collectionName - Collection to operate on
     * @param {string} [req.body.payload.documentID] - Document identifier (optional)
     * @param {Object} [req.body.payload.documentData] - Document data (optional)
     * @returns {Promise<Object>} Operation response
     */

    app.post("/manageDatabase", async (req, res) => {
        const { apiKey, databaseID, operation, collectionName, documentID, documentData } = req.body.payload;
        console.log(req.body.payload);
        console.log(apiKey);
        console.log(databaseID);
        console.log(operation);
        console.log(collectionName);
        console.log(documentID);
        console.log(documentData);

        if (!apiKey || !databaseID || !operation || !collectionName) {
            return res.status(400).json({ message: "Missing fields required for managing database" });
        }

        // CAN DO MORE VALIDATION HERE                                                                                                      {MORE VALIDATION}

        try {
            const response = await sendToDaemon({
                action: "manageDatabase",
                payload: { apiKey, databaseID, operation, collectionName, documentID, documentData }
            });
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: "Failed to communicate with daemon" });
        }
    });


    /**
     * Share a database with another user
     * @route POST /shareDatabase
     * @param {Object} req.body - Share request data
     * @param {string} req.body.databaseID - Database identifier
     * @param {string} req.body.targetUsername - Username to share with
     * @param {string} req.body.permissionType - Type of permissions to grant
     * @param {string} req.body.token - Authentication token
     * @returns {Promise<Object>} Share response
     */                   

    app.post('/shareDatabase', async (req, res) => {
      try {
        const { databaseID, targetUsername, permissionType, token } = req.body;

        if (!databaseID || !targetUsername || !permissionType || !token) {
            return res.status(400).json({
                status: 400,
                message: "Missing required fields (databaseID, targetUsername, permissionType, or token)",
                data: null,
            });
        }

        const requestData = {
            command: "shareDatabase",
            payload: req.body,
        };

        const daemonResponse = await sendToDaemon(requestData);
        res.status(daemonResponse.status).json(daemonResponse);
    } catch (error) {
        console.error("/shareDatabase error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            data: null,
        });
    }
    });


    /**
     * Revoke database sharing
     * @route POST /unshareDatabase
     * @param {Object} req.body - Unshare request data
     * @param {string} req.body.databaseID - Database identifier
     * @param {string} req.body.targetUsername - Username to revoke sharing from
     * @param {string} req.body.permissionType - Type of permissions to revoke
     * @param {string} req.body.token - Authentication token
     * @returns {Promise<Object>} Unshare response
     */

    app.post('/unshareDatabase', async (req, res) => {
      try {
        const { databaseID, targetUsername, permissionType, token } = req.body;

        if (!databaseID || !targetUsername || !permissionType || !token) {
            return res.status(400).json({
                status: 400,
                message: "Missing required fields (databaseID, targetUsername, permissionType, or token)",
                data: null,
            });
        }

        const requestData = {
            command: "unshareDatabase",
            payload: req.body,
        };

        const daemonResponse = await sendToDaemon(requestData);
        res.status(daemonResponse.status).json(daemonResponse);
    } catch (error) {
        console.error("/unshareDatabase error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            data: null,
        });
    }
    });

    return app;
}

// // Start the REST API server
// const server = app.listen(PORT, () => console.log(`REST API listening on port ${PORT}`));

// May need to store the server object to (i) close server (ii) web sockets etc
// SEAN's version
// const server = app.listen(PORT, () => {
//     console.log("Server listening on PORT: ", PORT);
// });


// export {app, server, sendToDaemon};