// // import bcrypt from "bcryptjs";
// const bcrypt = require("bcryptjs")


// //========================================================
// // NOTE: Making it so that alphanumeric hashing is used, makes 
// // it easier for normal string comparison to be done in the daemon.
// //=========================================================


// /**
//  * Hash a password and encode it to alphanumeric characters only
//  * @param {string} password - The plaintext password to hash
//  * @returns {Promise<string>} - The hashed password (alphanumeric only)
//  * @example
//  * const hashedPassword = await hashPassword("mySecurePassword123");
//  * console.log(hashedPassword); // Outputs an alphanumeric hash
//  */
// async function hashPassword(password) {
//     const hash = await bcrypt.hash(password, 10);
//     const base64Hash = Buffer.from(hash).toString('base64');
//     const alphanumericHash = base64Hash.replace(/[^a-zA-Z0-9]/g, '');
//     return alphanumericHash;
// }

// /**
//  * Compare a plaintext password with a hashed password
//  * @param {string} password - The plaintext password to verify
//  * @param {string} hashedPassword - The alphanumeric hashed password to compare against
//  * @returns {Promise<boolean>} - True if the password matches the hash, false otherwise
//  * @example
//  * const isMatch = await verifyPassword("mySecurePassword123", hashedPassword);
//  * console.log(isMatch); // Outputs true or false
//  */
// async function verifyPassword(password, hashedPassword) {
//     const hash = await bcrypt.hash(password, 10); 
//     const base64Hash = Buffer.from(hash).toString("base64").replace(/[^a-zA-Z0-9]/g, ""); 
//     return base64Hash === hashedPassword; 
// }

// module.exports = {
//     hashPassword,
//     verifyPassword
// };


const bcrypt = require("bcryptjs");

async function hashPassword(password) {
    // Generate a standard bcrypt hash
    return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashedPassword) {
    // Use bcrypt.compare to verify the password against the stored bcrypt hash
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    verifyPassword
};