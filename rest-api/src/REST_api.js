// import express from "express";
// import net from "net";
// import bodyParser from "body-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// dotenv.config({ path: 'config.env' });

const express = require("express");
const net = require("net");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config({ path: 'config.env' });

//==================== Auth_library import ====================
// import { hashPassword, verifyPassword } from "../../js-lib/src/auth.js";
const { hashPassword, verifyPassword } = require("../../js-lib/src/auth.js");
//============================================================

//==================== API_Auth libary import ====================
// import { generateApiKey } from "../../js-lib/src/APIauth.js";
const { generateApiKey } = require("../../js-lib/src/APIauth.js");
//================================================================

const app = express();
const PORT = process.env.PORT || 3000;  // REST API Port
const DAEMON_PORT = 5000;             // Daemon TCP Port
const DAEMON_HOST = "127.0.0.1";
const blacklistedKeys = new Set(); // used for the revoked keys.

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Helper function to communicate with the daemon
function sendToDaemon(requestData) {
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

// ==================== IBRAHIM ====================

// 1. Register User

// POST example for register ( will add extra fields when needed ):
// {
//     "payload": {
//         "username": "user8",
//         "name": "USER8",
//         "surname": "THEuser8",
//         "email": "user8@gmail.com",
//         "password": "userpass8",
//         "profileImage": null
//     }
// }
// }
app.post("/register", async (req, res) => {
    const { username, name, surname, email, password, profileImage } = req.body.payload; // Extract data from payload

    try {
        // Hash the password
        const hashedPass = await hashPassword(password);

        // Prepare the payload for the daemon
        const payload = {
            username,
            name,
            surname,
            email,
            password: hashedPass,
            profileImage: profileImage || null //optional 
        };

        // Send the payload to the daemon
        const response = await sendToDaemon({
            action: "register",
            payload: payload
        });

        // Send the response back to the client
        res.json(response);
    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({
            error: "User registration failed, please try again."
        });
    }
});

// 2. Login User
// EXample of a login
// {
//     "payload": {
//         "username": "user8",
//         "password": "userpass8"
//     }
// }
app.post("/login", async (req, res) => {
  // console.log("Request body:", req.body);

  // Get the username and the password from the payload
  const { username, password } = req.body.payload || {};

  if (!username || !password) {
      return res.status(400).json({
          error: "Username or password is missing in the request body."
      });
  }

  try {
      // Send login request to daemon
      const response = await sendToDaemon({
          action: "login",
          payload: { username , password }
      });



      if (!response) {
          console.error("sendToDaemon() returned undefined!");
          return res.status(500).json({
              error: "Internal server error: No response from daemon."
          });
      }

      if (response.status == 200){
        return res.json({
          message: "You have successfully logged in!"
        });
      }
      if (response.status !== 200) {
          return res.status(400).json({
              error: "User login details incorrect"
          });
      }

      // console.log("Received hashed password from daemon:", response.payload.hashedPass);
      // console.log("Entered password:", password);

      // Compare password with stored hash
      const match = await verifyPassword(password, response.payload.hashedPass);

      if (match) {
          return res.json({
              message: "You have successfully logged in!"
          });
      } else {
          return res.status(400).json({
              error: "Login failed, incorrect password."
          });
      }
  } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
          error: "Failed to communicate with the daemon."
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



// 3. GetAPIKey: Generate a JWT for the user (acts as the API key)
// input example:
// {
//     "payload": {
//         "username": "user8",
//         "password": "userpass8",
//         "email": "user8@gmail.com"
//     }
// }
app.post('/getAPIKey', async (req, res) => {
    // Expecting payload with _id, username, and email
    const { username, password, email, api_key } = req.body.payload || {};  
    if (api_key && blacklistedKeys.has(api_key)) {
        return res.status(403).json({ error: "The following API-key has been revoked." });
    }
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


// 4. Revoke API Key
// INput example:
// {
//     "username": "user8",
//     "password": "userpass8",
//     "api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXI4IiwiaWF0IjoxNzIzMjQyNjAwfQ.YOUR_SIGNATURE_HERE"
// }

//----------------------------------------------------------------------------------------------------------------------------------
// SO up until now this code checked user credentials and made sure the api_key inputted exists, now need to add a 'blacklisting' feature which 
// will be the closest thing to revoking or deleting an APIkey
app.post("/revokeAPIKey", async (req, res) => {

    const {username , password , api_key} = req.body;

    try{
        const response = await sendToDaemon({
            action: "login" , payload: {username}
        });

        if (response.status != 200){
            return res.status(400).json({
                error: "Invalid username or password, please try again."
            });
        }

        const match = await bcrypt.compare(password , response.payload.hashedPass);
        if (!match){
            return res.status(400).json({
                error:"Password incorrect. Please try again."
            });
        }

        try{
            jwt.verify(api_key,SECRET_KEY);
        }catch(err){
            return res.status(400).json({
                error:"Invalid API key."
            });
        }

        // REVOKED FUNCTIONALITY ADDDED HERE.
        blacklistedKeys.add(api_key);

        // JWTs cannot be revoked but can be blacklisted, implement this later though
        res.json({
            status:200 , message: "API key successfully revoked."
        });

    }catch(error){
        res.status(500).json({
            error:"Failed to revoke the API key."
        })
    }

});

// ==================== SEAN ====================

// 5. Update User                                                                                                                                       (DAEMON NOT DONE)
// app.put("/updateUser", async (req, res) => {
//     const updatedUser = req.body;

//     //Check if json body is missing or empty 
//     if(!updatedUser || Object.keys(updatedUser).length === 0)
//     {
//         return res.status(400).send({
//             status: 'HTTP/1.1 400 Bad Request',
//             message: 'JSON body empty'
//         });
//     }
//     //Check if required fields are there
//     //May have to add api-key array
//     if(!updatedUser.apiKey || !updatedUser.userID || !updatedUser.userData)
//     {
//         return res.status(400).send({
//             status: 'HTTP/1.1 400 Bad Request',
//             message: 'apiKey or userID or userData is missing'
//         });
//     }

//     //Make request to api
//     try{
//         const response = await sendToDaemon({
//             action: "updateUser",
//             payload: {apikKey: updatedUser.apiKey, userID: updatedUser.userID, userData: updatedUser.userData}
//         });
//         res.status(200).send(response);
//     }
//     catch(error)
//     {
//         res.status(500).json({ error: "Failed to communicate with daemon" });
//     }
// });

// 6. Get Public Database
app.post("/getPublicDatabases", async (req, res) => {
    const {limit, offset} = req.body.payload;
    console.log(req.body.payload);
    console.log("Limit: " + limit);
    console.log("Offset: " + offset);
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

// 7. Get List of owned and shared Databases
//Changed to post for dealing with api key
app.post("/getDatabases", async (req, res) => {
    const databases = req.body.payload;
    console.log(req.body.payload);
    console.log("API Key: " + databases.apiKey);


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

// ==================== VANSH ====================

// 8. createDatabase: Create a new database for the user
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

// 9. deleteDatabase: Delete a database (using URL param for databaseID)
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

// 10. loadDatabase: Load a database into memory                                                                                        (DAEMON NOT DONE)
// app.post('/loadDatabase', async (req, res) => {
//   const { databaseID, jwtToken } = req.body.payload;
//   if (!databaseID || !jwtToken) {
//     return res.status(400).json({ message: "Database ID and JWT token are required" });
//   }
//   try {
//     const response = await sendToDaemon({
//       action: "loadDatabase",
//       payload: { databaseID, jwtToken }
//     });
//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to communicate with daemon" });
//   }
// });

// 11. unloadDatabase: Unload a database from memory                                                                                    (DAEMON NOT DONE)
// app.post('/unloadDatabase', async (req, res) => {
//   const { databaseID, jwtToken } = req.body.payload;
//   if (!databaseID || !jwtToken) {
//     return res.status(400).json({ message: "Database ID and JWT token are required" });
//   }
//   try {
//     const response = await sendToDaemon({
//       action: "unloadDatabase",
//       payload: { databaseID, jwtToken }
//     });
//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to communicate with daemon" });
//   }
// });

// ==================== OWETHU ====================

// 12. Manage Database                             
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


// 13. shareDatabase: Share a database with another user                                                                    (DAEMON NOT DONE)
app.post('/shareDatabase', async (req, res) => {
});

// 14. unshareDatabase: Revoke sharing of a database                                                                         (DAEMON NOT DONE)
app.post('/unshareDatabase', async (req, res) => {
});

// Start the REST API server
app.listen(PORT, () => console.log(`REST API listening on port ${PORT}`));

// May need to store the server object to (i) close server (ii) web sockets etc
// SEAN's version
// const server = app.listen(PORT, () => {
//     console.log("Server listening on PORT: ", PORT);
// });


// export {app, server, sendToDaemon};