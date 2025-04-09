// import bcrypt from "bcryptjs";
const bcrypt = require("bcryptjs")



/**
 * Hash a password
 * @param {string} password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

/**
 * Compare a plaintext password with a hashed password
 * @param {string} password 
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} - True if match, else false
 */
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

// Export the functions using CommonJS syntax
module.exports = {
    hashPassword,
    verifyPassword
};

// /**
//  * Send request to the MPDB daemon
//  * @param {Object} requestData - The request payload
//  * @returns {Promise<Object>} - The response from daemon
//  */
// export async function sendToDaemon(requestData) {
//     return new Promise((resolve, reject) => {
//         const net = require("net");
//         const client = new net.Socket();

//         client.connect(5000, "127.0.0.1", () => {
//             client.write(JSON.stringify(requestData));
//         });

//         client.on("data", (data) => {
//             resolve(JSON.parse(data.toString()));
//             client.destroy();
//         });

//         client.on("error", (err) => reject(err));
//     });
// }
