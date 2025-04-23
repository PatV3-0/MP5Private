// mpdbClient.js
class MPDBClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl; // Base URL of your REST API, e.g., "http://localhost:3000"
  }

  // Internal helper to make HTTP requests using fetch
  async request(endpoint, method, data = null) {
    const url = `${this.apiUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };


    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error || errorData.message}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Request error:", error);
      throw error;
    }
  }

  // 1. Register a new user
  async register(userData) {
    // userData should include: username, password, email, name, surname, (optionally profileImage)
    const payload = { payload: userData };
    return this.request("/register", "POST", payload);
  }

  // 2. Login a user
  async login(username, password) {
    // Expecting a payload with username and password.
    const payload = { payload: { username, password } };
    const response = await this.request("/login", "POST", payload);
    // You might choose to store a token here if your login endpoint returns one.
    // For example, if the login response includes a JWT token:
    // this.token = response.data.token;
    return response;
  }

  // 3. Get an API key (JWT) for the user
  async getAPIKey(username, password, email) {
    // Expects a payload with username, password, and email.
    const payload = { payload: { username, password, email } };
    const response = await this.request("/getAPIKey", "POST", payload);
    // Store the JWT token for future requests
    if (response.status === 200 && response.data) {
      this.token = response.data;
    }
    return response;
  }

  // 4. Revoke API key (placeholder; actual behavior depends on your daemon)
  async revokeAPIKey(data) {
    // data can include the username, password, and current API key
    const payload = { payload: data };
    return this.request("/revokeAPIKey", "POST", payload);
  }

  // 5. Update user details
  async updateUser(updateData) {
    // updateData should contain the necessary fields (e.g., apiKey, userID, userData)
    const payload = { payload: updateData };
    return this.request("/updateUser", "PUT", payload);
  }

  // 6. Get public databases
  async getPublicDatabases(limit, offset) {
    // Pass any pagination parameters if required in payload
    const payload = { payload: { limit, offset } };
    return this.request("/getPublicDatabases", "POST", payload);
  }

  // 7. Get user-owned (or shared) databases (requires JWT for authentication)
  async getDatabases(apiKey) {
    // You can also use this.token if you have stored it from login/API key
    const payload = { payload: { apiKey } };
    return this.request("/getDatabases", "POST", payload);
  }

  // async getDatabases(apiKey) {
  //   // Ensure an API key is provided
  //   if (!apiKey) {
  //     throw new Error("API key is required");
  //   }
  //   // Build the endpoint URL with the API key as a query parameter
  //   const endpoint = `/getDatabases?apiKey=${encodeURIComponent(apiKey)}`;
  //   return this.request(endpoint, "GET");
  // }
  

  // 8. Create a new database (requires JWT)
  async createDatabase(dbName, apiKey = this.token) {
    const payload = { payload: { dbName, apiKey } };
    return this.request("/createDatabase", "POST", payload);
  }

  // 9. Delete a database (requires JWT)
  async deleteDatabase(dbName, apiKey = this.token) {
    const payload = { payload: { dbName, apiKey } };
    return this.request("/deleteDatabase", "POST", payload);
  }

  // 10. Load a database (requires JWT)
  async loadDatabase(databaseID, apiKey = this.token) {
    const payload = { payload: { databaseID, apiKey } };
    return this.request("/loadDatabase", "POST", payload);
  }

  // 11. Unload a database (requires JWT)
  async unloadDatabase(databaseID, apiKey = this.token) {
    const payload = { payload: { databaseID, apiKey } };
    return this.request("/unloadDatabase", "POST", payload);
  }

  // 12. Manage a database (e.g., update collection, add document, update document)
  async manageDatabase(manageData) {
    // manageData should include: apiKey, databaseID, operation, collectionName, documentID (if applicable), documentData (if applicable)
    const payload = { payload: manageData };
    return this.request("/manageDatabase", "POST", payload);
  }

  // 13. Share a database with another user (requires JWT)
  async shareDatabase(shareData) {
    // shareData should include: databaseID, targetUser, apiKey (JWT)
    const payload = { payload: shareData };
    return this.request("/shareDatabase", "POST", payload);
  }

  // 14. Unshare a database (requires JWT)
  async unshareDatabase(unshareData) {
    // unshareData should include: databaseID, targetUser, apiKey (JWT)
    const payload = { payload: unshareData };
    return this.request("/unshareDatabase", "POST", payload);
  }

  // 15. get User
  async getUser(apiKey) {
    // apiKey should be the JWT token
    const payload = { payload: { apiKey } };
    return this.request("/getUser", "POST", payload);
  }

}

// Export an instance or the class itself for use
export default MPDBClient;
// module.exports = MPDBClient;

