// exampleUsage.js
// import MPDBClient from "./mpdbjs.js";
const MPDBClient = require("./mpdbjs.js");


const apiUrl = "http://localhost:3000"; // Your REST API base URL
const client = new MPDBClient(apiUrl);

async function runExample() { // username, name, surname, email, password, profileImage
  try {
    // 1. Register a new user
    const regResponse = await client.register({
      username: "Alice",
      name: "Alice",
      surname: "Smith",
      password: "pass123",
      email: "alice@example.com"
    });
    console.log("Register Response:", regResponse);

    // 2. Get an API key (JWT) for the user (or you might get this from the login response)
    const keyResponse = await client.getAPIKey("alice", "pass123", "alice@example.com");
    console.log("GetAPIKey Response:", keyResponse);

    // 3. Use the token to create a new database
    const createResponse = await client.createDatabase("MyNewDatabase");
    console.log("Create Database Response:", createResponse);

    const deleteResponse = await client.deleteDatabase("MyNewDatabase");
    console.log("Delete Database Response:", deleteResponse);

    // 4. Retrieve the list of databases
    const apiKey = keyResponse.data;
    console.log("API Key:", apiKey);
    const listResponse = await client.getDatabases(apiKey);
    console.log("Get Databases Response:", listResponse);

    // You can continue calling other methods as needed...
  } catch (error) {
    console.error("Error in API call:", error);
  }
}

runExample();
