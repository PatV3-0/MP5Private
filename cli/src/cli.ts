#!/usr/bin/env node
import {Command} from "commander";
import { spawn } from "child_process";
import { exec } from "child_process";
import { readFileSync, existsSync, unlinkSync, writeFileSync} from "fs";
import * as fs from 'fs';
import * as net from "net";
// import figlet from "figlet";
import chalk from "chalk";
import { permission } from "process";

const program = new Command();
const PID_FILE = "../../daemon/src/daemon.lock";
const PORT = 5000;
const SESSION_FILE = "./.session.json";

function printLogo() {
  console.log(chalk.rgb(255, 117, 24)("\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠙⠻⢶⣄⡀⠀⠀⠀⢀⣤⠶⠛⠛⡇⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣇⠀⠀⣙⣿⣦⣤⣴⣿⣁⠀⠀⣸⠇⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣡⣾⣿⣿⣿⣿⣿⣿⣿⣷⣌⠋⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣷⣄⡈⢻⣿⡟⢁⣠⣾⣿⣦⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⠘⣿⠃⣿⣿⣿⣿⡏⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠈⠛⣰⠿⣆⠛⠁⠀⡀⠀⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣦⠀⠘⠛⠋⠀⣴⣿⠁⠀⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣾⣿⣿⣿⣿⡇⠀⠀⠀⢸⣿⣏⠀⠀⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠀⠀⠀⠾⢿⣿⠀⠀⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⡿⠟⠋⣁⣠⣤⣤⡶⠶⠶⣤⣄⠈⠀⠀⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⢰⣿⣿⣮⣉⣉⣉⣤⣴⣶⣿⣿⣋⡥⠄⠀⠀⠀⠀⠉⢻⣄⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣟⣋⣁⣤⣀⣀⣤⣤⣤⣤⣄⣿⡄⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠛⠋⠉⠁⠀⠀⠀⠀⠈⠛⠃⠀⠀⠀⠀"));
  console.log(chalk.rgb(255, 117, 24)("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"));
}

function getSession() {
  if (existsSync(SESSION_FILE)) {
    const session = JSON.parse(readFileSync(SESSION_FILE, 'utf8'));
    return session;
  }
  return null;
}

program
    .name("mycli")
    .description("A CLI to interact with the daemon")
    .version("1.0.0");

program
    .command("start")
    .description("start the daemon")
    .action(()=>{

      printLogo();

      // Properly detach the daemon
      const daemon = spawn("npx", ["tsx", "../../daemon/src/mpdbd.ts"], {
        stdio: ['ignore', 'ignore', 'ignore'], // Redirect all stdio to /dev/null
        shell: true,
        detached: true, // Necessary for full detachment
        windowsHide: true // Hide console window on Windows
      });
      
      // Unref the child process to allow the parent to exit independently
      daemon.unref();
      console.log(`Daemon started with PID: ${daemon.pid}`);
    });
program
    .command("status")
    .description("check daemon status")
    .action(() =>{

       if(existsSync(PID_FILE)){
        const pid = readFileSync(PID_FILE,"utf-8").trim();
        console.log(`daemon is running (PID: ${pid})`);
       }
       else{
        console.log("daemon is not running");
       }

    })

program
    .command("stop")
    .description("stops the daemon")
    .action(() =>{

        if (!existsSync(PID_FILE)) {
            console.log("❌ Daemon is not running.");
            return;
          }
      
          const pid = readFileSync(PID_FILE, "utf-8").trim();
          //console.log(pid);
          const killCommand = process.platform === "win32" ? `taskkill /PID ${pid} /F` : `kill ${pid}`;
          console.log(killCommand);
      

        exec(killCommand, (error, stdout, stderr)=>{
            if(error){
                console.log("failed to stop daemon: ",stderr);
            }
            else{
                console.log("Daemon stoped successfully.");
                unlinkSync(PID_FILE);
            }
        })

    });
    

    program 
      .command("register")
      .description("register user")
      .option("--payload <payload>", "Payload to be sent with the request")
      .action(async (cmd) => {
        const {payload } = cmd;
    
        if (!payload) {
          console.error("Action and payload are required.");
          return;
        }
    
        const client = new net.Socket();
    
        client.connect(5000, "localhost", () => {
          const request = {
            action:"register",
            payload: JSON.parse(payload)
          };
    
          client.write(JSON.stringify(request)); 
        });
    
        client.on("data", (data) => {
          console.log("Received:", data.toString());
          client.destroy();
        });
    
        client.on("error", (err) => {
          console.error("Error:", err);
        });
      });


      

    program
      .command("send-request")
      .description("Send request to the daemon")
      .option("--action <action>", "Action to be performed")
      .option("--payload <payload>", "Payload to be sent with the request")
      .action(async (cmd) => {
        const { action, payload } = cmd;
    
        if (!action || !payload) {
          console.error("Action and payload are required.");
          return;
        }
    
        const client = new net.Socket();
    
        client.connect(5000, "localhost", () => {
          const request = {
            action:action,
            payload: JSON.parse(payload) // Parse the stringified JSON payload
          };
    
          client.write(JSON.stringify(request)); // Send the request to the daemon
        });
    
        client.on("data", (data) => {
          console.log("Received:", data.toString());
          client.destroy();
        });
    
        client.on("error", (err) => {
          console.error("Error:", err);
        });
      });

program 
      .command("login <username> <password>")
      .description("Login user")
      .action(async (username, password) => {
        const client = new net.Socket();
    
        client.connect(PORT, "localhost", () => {
          const request = {
            action: "login",
            payload: {
              username: username,
              password: password
            }
          };
          client.write(JSON.stringify(request));
        });
    
        client.on("data", (data) => {
          const response = JSON.parse(data.toString());
          
          if (response.status === 200) {
            // Get JWT token after successful login
            const jwtRequest = {
              action: "getAPIkey",
              payload: {
                username: username,
                password: password
              }
            };
            
            const jwtClient = new net.Socket();
            jwtClient.connect(5000, "localhost", () => {
              jwtClient.write(JSON.stringify(jwtRequest));
            });
    
            jwtClient.on("data", (jwtData) => {
              const jwtResponse = JSON.parse(jwtData.toString());
              if (jwtResponse.status === 200) {
                const session = {
                  username: username,
                  jwt: jwtResponse.data, // Store JWT instead of hashed password
                  loggedIn: true
                };
                writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
                console.log(chalk.green("✓ Successfully logged in"));
              }
              jwtClient.destroy();
            });
          }
          client.destroy();
        });
      });
program
  .command("logout")
  .description("Logout current user")
  .action(() => {
    if (existsSync(SESSION_FILE)) {
      unlinkSync(SESSION_FILE);
      console.log(chalk.green("✓ Successfully logged out"));
    } else {
      console.log(chalk.yellow("! No active session found"));
    }
  });

program
  .command("whoami")
  .description("Display current logged in user")
  .action(() => {
    const session = getSession();
    if (session && session.username) {
      console.log(chalk.green(`Logged in as: ${session.username}`));
    } else {
      console.log(chalk.yellow("Not logged in"));
    }
  });

  program
  .command("public-databases")
  .description("Get all public databases")
  .action(() => {
    const client = new net.Socket();
    client.connect(PORT, "localhost", () => {
      const request = {
        action: "getPublicDatabases",
        payload: {} // Ensure we send empty payload
      };
      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      if (response.status !== 200) {
        console.log(chalk.red(`Error: ${response.message}`));
        return;
      }
      // Add error handling for empty data
      if (!response.data || response.data.length === 0) {
        console.log(chalk.yellow("No public databases available"));
        return;
      }
      if (response.status === 200) {
        console.log(chalk.green("\nPublic Databases:"));
        if (response.data && response.data.length > 0) {
          response.data.forEach((db: any) => {
            console.log(chalk.blue(`\nDatabase: ${db.name}`));
            console.log(chalk.white(`Owner: ${db.owner}`));
            console.log(chalk.white(`Description: ${db.description || 'No description'}`));
            
            if (db.collections && db.collections.length > 0) {
              console.log(chalk.yellow(`Collections:`));
              db.collections.forEach((collection: any) => {
                console.log(chalk.gray(`  - ${collection.name}`));
              });
            }
            console.log(chalk.gray("------------------------"));
          });
        } else {
          console.log(chalk.yellow("No public databases found"));
        }
      } else {
        console.log(chalk.red(`Error: ${response.message}`));
      }
      
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(chalk.red("Error:", err));
    });
  });

program
  .command("my-databases")
  .description("Get all databases for the logged-in user")
  .action(() => {
    const session = getSession();
    if (!session || !session.loggedIn || !session.jwt) {
      console.log(chalk.yellow("! Please login first"));
      return;
    }

    const client = new net.Socket();
    client.connect(PORT, "localhost", () => {
      const request = {
        action: "getDatabases",
        payload: {apiKey : session.jwt}
      };
      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      
      if (response.status === 200) {
        console.log(chalk.green("\nYour Databases:"));
        if (response.data && response.data.length > 0) {
          response.data.forEach((db: any) => {
            console.log(chalk.blue(`\nDatabase: ${db.name}`));
            console.log(chalk.white(`Description: ${db.description || 'No description'}`));
            
            if (db.collections && db.collections.length > 0) {
              console.log(chalk.yellow(`Collections:`));
              db.collections.forEach((collection: any) => {
                console.log(chalk.gray(`  - ${collection.name}`));
              });
            }
            console.log(chalk.gray("------------------------"));
          });
        } else {
          console.log(chalk.yellow("You don't have any databases yet"));
        }
      } else {
        console.log(chalk.red(`Error: ${response.message}`));
      }
      
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(chalk.red("Error:", err));
    });
  });

  program
  .command("create-database")
  .description("Create a new database")
  .option("--name <name>", "Name of the database to create")
  .action(async (cmd) => {
    const { name, token } = cmd;
    const session = getSession();
    if (!name) {
      console.error("Error: Database name is required");
      console.log("Usage: mycli create-database --name <name>");
      return;
    }

    const client = new net.Socket();

    client.connect(PORT, "localhost", () => {
      console.log(`Creating database: ${name}...`);
      
      // The daemon expects the JWT token directly in the payload field
      // along with the dbName
      const request = {
        action: "createDatabase",
        payload: {
          apiKey: session.jwt.toString(), // JWT token that will be decoded on the server
          dbName: name
        }
      };

      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      try {
        const response = JSON.parse(data.toString());
        
        if (response.status === 200) {
          console.log(`✅ ${response.message}`);
          if (response.data && response.data.databaseID) {
            console.log(`Database ID: ${response.data.databaseID}`);
          }
        } else {
          console.error(`❌ Error: ${response.message} (Status: ${response.status})`);
        }
      } catch (error) {
        console.error("Failed to parse response:", error);
      }
      
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(`Connection error: ${err.message}`);
      console.log("Make sure the daemon is running (use 'mycli start' to start it)");
    });
  });

  
  program
    .command("delete-database")
    .description("Delete an existing database")
    .requiredOption("--name <name>", "Name of the database to delete")
    .action(async (options) => {
      const {name} = options;
      const session = getSession();
      
      console.log(`Deleting database: ${name}...`);
      
      const client = new net.Socket();
      
      client.connect(PORT, 'localhost', () => {
        console.log('Connected to daemon');
        
        const request = {
          action: "deleteDatabase",
          payload: {
            apiKey: session.jwt, // Daemon expects 'apiKey', not 'token'
            dbName: name
          }
        };
        
        client.write(JSON.stringify(request));
      });
      
      client.on('data', (data) => {
        try {
          const response = JSON.parse(data.toString());
          
          if (response.status === 200) {
            console.log(`✅ Database "${name}" deleted successfully!`);
          } else {
            console.error(`❌ Error: ${response.message} (Status: ${response.status})`);
          }
        } catch (error) {
          console.error('Failed to parse response:', error);
        }
        
        client.destroy();
      });
      
      client.on('close', () => {
        console.log('Connection closed');
      });
      
      client.on('error', (err) => {
        console.error(`Connection error: ${err.message}`);
        console.log('Make sure the daemon is running (use the start command to start it)');
      });
    });

    program
  .command("manage-database")
  .description("Manage database operations (create/delete collections, add/update documents)")
  .requiredOption("--db-id <databaseID>", "ID of the database to manage")
  .requiredOption("--operation <operation>", "Operation to perform: Create, Add, Update, Delete")
  .requiredOption("--collection <collectionName>", "Name of the collection")
  .option("--doc-id <documentID>", "ID of the document (for Update/Delete operation)")
  .option("--doc-data <docDataPath>", "Path to JSON file containing document data (for Add/Update operations)")
  .action(async (options) => {
    const { dbId, operation, collection, docId, docData } = options;
    
    // Validate options based on operation
    if ((operation === 'Add' || operation === 'Update') && !docData) {
      console.error(`❌ Error: Document data is required for ${operation} operation`);
      console.log(`Use --doc-data to specify a JSON file containing document data`);
      return;
    }
    
    if (operation === 'Update' && !docId) {
      console.error(`❌ Error: Document ID is required for ${operation} operation`);
      console.log(`Use --doc-id to specify the document ID`);
      return;
    }

    if (operation === 'Delete' && !docId) {
      console.log(chalk.blue("ℹ No --doc-id provided; will delete the entire collection."));
    }
    
    console.log(`Managing database: Operation=${operation}, Collection=${collection}`);
    if (docId) console.log(`Document ID: ${docId}`);
    
    // Read document data if provided
    let documentData = {};
    if (docData) {
      try {
        const data = fs.readFileSync(docData, 'utf8');
        documentData = JSON.parse(data);
        console.log(`Document data loaded from ${docData}`);
      } catch (error) {
        console.error(`❌ Error: Failed to read document data from ${docData}`);
        console.error(error);
        return;
      }
    }
    
    const client = new net.Socket();
    const session = getSession();
    if (!session || !session.jwt) {
      console.log(chalk.yellow("! You must be logged in to manage a database"));
      return;
    }
    
    client.connect(PORT, 'localhost', () => {
      console.log('Connected to daemon');
      
      const payload = {
        apiKey: session.jwt,
        databaseID: dbId,
        operation: operation,
        collectionName: collection
      };
      
      // Add document data or ID depending on operation
      if (operation === 'Add' || operation === 'Update') {
        payload['documentData'] = documentData;
      }
      
      if (operation === 'Update' || (operation === "Delete" && docId)) {
        payload['documentID'] = docId;
      }
      
      const request = {
        action: "manageDatabase",
        payload: payload
      };
      
      client.write(JSON.stringify(request));
    });
    
    client.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        
        if (response.status === 200) {
          console.log(`✅ ${response.message}`);
          if (response.data) {
            console.log('Response data:');
            console.log(JSON.stringify(response.data, null, 2));
          }
        } else {
          console.error(chalk.red(`❌ Error: ${response.message || "Unknown error"}`));
        }
      } catch (error) {
        console.error('Failed to parse response:', error);
      }
      
      client.destroy();
    });
    
    client.on('close', () => {
      console.log('Connection closed');
    });
    
    client.on('error', (err) => {
      console.error(`Connection error: ${err.message}`);
      console.log('Make sure the daemon is running (use the start command to start it)');
    });
  });

  /* program
  .command("update-user")
  .description("Update your user profile information")
  .requiredOption("--user-id <id>", "User ID")
  .requiredOption("--data <path>", "Path to JSON file with user data to update")
  .action(async (opts) => {
    const session = getSession();
    if (!session || !session.jwt) {
      console.log(chalk.yellow("Please login first."));
      return;
    }

    try {
      const raw = fs.readFileSync(opts.data, "utf8");
      const userData = JSON.parse(raw);

      const request = {
        action: "updateUser",
        payload: {
          apiKey: session.jwt,
          userID: opts.userId,
          userData
        }
      };

      const client = new net.Socket();
      client.connect(PORT, "localhost", () => {
        client.write(JSON.stringify(request));
      });

      client.on("data", (data) => {
        const response = JSON.parse(data.toString());
        console.log(response.status === 200 ? chalk.green("✓ Profile updated") : chalk.red(`❌ ${response.message}`));
        client.destroy();
      });

    } catch (e) {
      console.error(chalk.red("Error reading user data file:"), e);
    }
  }); */

  program
  .command("load-database")
  .description("Load a database for exclusive management access")
  .requiredOption("--db-id <databaseID>", "ID of the database to load")
  .action((options) => {
    const session = getSession();
    if (!session || !session.jwt) {
      console.log(chalk.yellow("! You must be logged in to load a database"));
      return;
    }

    const client = new net.Socket();

    client.connect(PORT, "localhost", () => {
      const request = {
        action: "loadDatabase",
        payload: {
          apiKey: session.jwt,
          databaseID: options.dbId
        }
      };

      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      if (response.status === 200) {
        console.log(chalk.green(`✓ Database loaded successfully.`));
      } else {
        console.error(chalk.red(`❌ Error: ${response.message}`));
      }
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(chalk.red("Connection error:"), err.message);
    });
  });

  program
  .command("unload-database")
  .description("Unload a database after management is complete")
  .requiredOption("--db-id <databaseID>", "ID of the database to unload")
  .action((options) => {
    const session = getSession();
    if (!session || !session.jwt) {
      console.log(chalk.yellow("! You must be logged in to unload a database"));
      return;
    }

    const client = new net.Socket();

    client.connect(PORT, "localhost", () => {
      const request = {
        action: "unloadDatabase", // typo in README fixed here
        payload: {
          apiKey: session.jwt,
          databaseID: options.dbId
        }
      };

      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      if (response.status === 200) {
        console.log(chalk.green(`✓ Database unloaded successfully.`));
      } else {
        console.error(chalk.red(`❌ Error: ${response.message}`));
      }
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(chalk.red("Connection error:"), err.message);
    });
  });

  program
  .command("share-database")
  .description("Share a database with another user")
  .requiredOption("--user-name <userName>", "Name of the user to share the database with")
  .requiredOption("--db-id <databaseID>", "ID of the database to share")
  .requiredOption("--permission <permission>", "Permission level (read/write)")
  .action((options) => {
    const session = getSession();
    if (!session || !session.jwt) {
      console.log(chalk.yellow("! You must be logged in to share a database"));
      return;
    }

    const client = new net.Socket();
    client.connect(PORT, "localhost", () => {
      const request = {
        action: "shareDatabase",
        payload: {
          apiKey: session.jwt,
          targetUsername: options.userName,
          databaseID: options.dbId,
          permissionType: options.permission
        }
      };
      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      if (response.status === 200) {
        console.log(chalk.green(`✓ Database shared with user ${options.userId}`));
      } else {
        console.error(chalk.red(`❌ Error: ${response.message}`));
      }
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(chalk.red("Connection error:"), err.message);
    });
  });

  program
  .command("unshare-database")
  .description("Unshare all databases with a specific user")
  .requiredOption("--user-name <userName>", "Name of the user to unshare the database with")
  .requiredOption("--db-id <databaseID>", "ID of the database to unshare")
  .requiredOption("--permission <permission>", "Permission level (read/write)")
  .action((options) => {
    const session = getSession();
    if (!session || !session.jwt) {
      console.log(chalk.yellow("! You must be logged in to unshare a database"));
      return;
    }

    const client = new net.Socket();
    client.connect(PORT, "localhost", () => {
      const request = {
        action: "unshareDatabase",
        payload: {
          apiKey: session.jwt,
          targetUsername: options.userName,
          databaseID: options.dbId,
          permissionType: options.permission
        }
      };
      client.write(JSON.stringify(request));
    });

    client.on("data", (data) => {
      const response = JSON.parse(data.toString());
      if (response.status === 200) {
        console.log(chalk.green(`✓ Database(s) unshared from user ${options.userId}`));
      } else {
        console.error(chalk.red(`❌ Error: ${response.message}`));
      }
      client.destroy();
    });

    client.on("error", (err) => {
      console.error(chalk.red("Connection error:"), err.message);
    });
  });

program.parse(process.argv);