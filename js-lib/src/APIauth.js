// import jwt from "jsonwebtoken"
// import bcrypt from "bcryptjs"

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

/**
 * Generate an API key (JWT) for a user
 * @param {string} username 
 * @param {string} hashedPassword 
 * @param {string} password 
 * @returns {Promise<{apiKey: string, expiresAt: Date}>} - API key and expiry date
 */
async function generateApiKey(username, hashedPassword, password) {
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
        throw new Error("Incorrect password. Please try again.");
    }

    // Create API key
    const apiKey = jwt.sign(
        { username }, SECRET_KEY, { expiresIn: "24h" } // 24 hours before expiration
    );

    return {
        apiKey,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };
}

// Export the function using CommonJS syntax
module.exports = {
    generateApiKey
};