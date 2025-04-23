// Authentication and Authorizaton
import * as fs from "fs";
import * as path from "path";
// import Response from './ResponseRequestInterface.ts';
// import * as net from "net";
import FileManager from "./FileManager.js"; 
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { hashPassword/*, verifyPassword */} from "./encryption.js";

////Auth
// const KEY = process.env.MP5_SECRET_KEY; // JWT hash key
const KEY = process.env.MP5_SECRET_KEY || "your-default-secret-key"; // Fallback for safety
const JSON_FILE = path.join(__dirname, "users.json");
const REVOKED_KEYS_FILE = path.join(__dirname, "revoked_keys.json");

// Check if JSON file exists, if not create it with default data structure
if (!fs.existsSync(JSON_FILE)) {
  const initialData = { users: [] };
  fs.writeFileSync(JSON_FILE, JSON.stringify(initialData, null, 2));
}

//let jsonData = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));

//===================================================================================
// A list of revoked keys

// Ensure JSON file exists
if (!fs.existsSync(JSON_FILE)) {
  const initialData = { users: [] };
  fs.writeFileSync(JSON_FILE, JSON.stringify(initialData, null, 2));
}

// Ensure the revoked keys file exists
if (!fs.existsSync(REVOKED_KEYS_FILE)) {
  fs.writeFileSync(REVOKED_KEYS_FILE, JSON.stringify([]));
}


// Load revoked keys with error handling
let initialKeys: string[] = [];
try {
    initialKeys = JSON.parse(fs.readFileSync(REVOKED_KEYS_FILE, "utf8"));
    if (!Array.isArray(initialKeys)) {
        initialKeys = [];
    }
} catch (error) {
    console.error("Error reading revoked keys file:", error);
    initialKeys = [];
}
const blacklistedKeys = new Set<string>(initialKeys);
//=================================================================================


export class AuthenticationHandler{

  private USER_FILE: string = path.join(__dirname, "databases/admin/users.json");
  private connection: boolean;
  private fileManager = new FileManager();

  constructor(){
    //Open user's file
    //If already open try again in 3 seconds
    if (!fs.existsSync(this.USER_FILE)) {
      console.error("Users Database does not exist");
      this.connection = false
    }

    else{
      this.connection = true;
    }
    
  }
  

  public async registerUser(data:{username: string, password: string, email: string, name: string, surname: string}){

    try{
      
      //let userData: any[];
      const fileManager = new FileManager();
      const userData = fileManager.readFile(this.USER_FILE);

      const existingUser = userData.find(user=>user.username===data.username);

      if(existingUser){
        return false;
      }

      //console.log(userData.length)
      const newID = userData.length.toString().padStart(6, '0');

      const hashedPassword = await hashPassword(data.password);
      // console.log("OG PASSWORD: ", data.password);
      // console.log("Hashed Password: ", hashedPassword);
      const newUser={
    //need to add randomgeneration for id and accommodate name and surname
        _id:newID,
        username:data.username,
        password:hashedPassword,
        admin: false,
        name: data.name,
        surname: data.surname,
        email:data.email,
        profileImage: "",
        databases: [],
        saveddatabases: [],
        followers: [],
        following: []
      }

      userData.push(newUser);
      fs.writeFileSync(this.USER_FILE,JSON.stringify(userData,null,2));
      return true;

    }
    catch(error){
      console.error("Error registering user:",error);
      return{success:false};
    }

  }

  // public loginUser(data){
  // public loginUser(data){

  //   //Need to decide if logging in should do anything else
  //   //Need to decide if logging in should do anything else

  //   let loginAuth = new AuthorizationHandler();
  //   if(loginAuth.checkLogin(data) === true){
  //       return true;
  //   }

  //   return false;

  // }
  //public async loginUser(data): Promise<boolean> {
  //   let loginAuth = new AuthorizationHandler();
  //   if(loginAuth.checkLogin(data) === true){
  //       return true;
  //   }

  //   return false;

  // }
  public async loginUser(data): Promise<boolean> {
    let loginAuth = new AuthorizationHandler();

    const isValid = await loginAuth.checkLogin(data); 
    return isValid;
  }



  public generateAPIkey(data:{_id:number, username:string, email:string}){

    const date = new Date();

    const payload = {
      userID: data._id,
      username: data.username,
      email: data.email,
      admin: false,
      date: date.getTime()
    };
    
    const options = {
      expiresIn: 2880
    };
    
  
    const token = jwt.sign(payload, KEY, options);
    console.log(`${data.username} generated a new JWT token`);

    return token;
  }

  // public revokeAPIkey(data){
  //     //Either save in db or implement a blacklist, come back later
  //     console.log(`API KEY REVOKED: ${data}`)
  // } 

  public getConnection(){
    return this.connection;
  }

  //Helpers
  private userExists(data:{username:string}): boolean{
    let users = this.fileManager.readFile("users");

    for(let user of users){
      if(user.username == data.username){
          return true;
        }
    }
    return false;
  }

  public revokeAPIkey(data: { apiKey: string }): boolean {
    const authHandler = new AuthorizationHandler();
    return authHandler.revokeAPIkey(data);
  }
}

export class AuthorizationHandler{
  private USER_FILE: string = path.join(__dirname, "databases/admin/users.json");
  private connection: boolean;
  private fileManager = new FileManager();

  constructor(){
    if (!fs.existsSync(this.USER_FILE)) {
      console.error("Users Database does not exist");
      this.connection = false
    }

    else{
      //conneciton to users file est
      this.connection = true;
    }
  }

  public verifyJWTIntegrity(data:{apiKey: string}){

    //Returns false if invalid
    //Returns decoded token if valid

    let isValid: boolean = false;
console.log("api keya::::",data.apiKey);
    if(!data.apiKey){
      console.log("API key not set");
      return isValid;
      }

    jwt.verify(data.apiKey, KEY, (err, decoded) => {
      if (err) {
        console.log("Token is invalid");
        isValid = false;
      } else {
        console.log(`Token validated: ${decoded}`);
        isValid = true;
      }
    });
    
    return isValid;
  }

  public revokeAPIkey(data: { apiKey: string }): boolean {
    const { apiKey } = data;

    // Check if the API key is valid before revoking
    if (! this.verifyJWTIntegrity({ apiKey })) {
      console.log("Cannot revoke: Invalid or malformed API key");
      return false;
    }

    // Check if the key is already blacklisted
    if (blacklistedKeys.has(apiKey)) {
      console.log("API key already revoked");
      return true; // Already revoked, so technically "successful"
    }

    // Add to blacklist
    blacklistedKeys.add(apiKey);
    // Persist the blacklist to the file
    try {
      fs.writeFileSync(REVOKED_KEYS_FILE, JSON.stringify(Array.from(blacklistedKeys), null, 2));
      console.log(`API key revoked and saved: ${apiKey}`);
      return true;
    } catch (error) {
      console.error("Failed to save revoked keys to file:", error);
      return false;
    }  
  }



  public decodeJWT(data:{apiKey: string}){
    let dec = null;
    if(this.verifyJWTIntegrity(data)){
      jwt.verify(data.apiKey, KEY, (err, decoded) => {
        if (err) {console.log("wot");} 
        else {
          dec = decoded;
          console.log("HERE");
          console.log(decoded);
          console.log("HERE");
          console.log(decoded);
        }
      });
    }
    return dec;
  }
  // public checkLogin(data:{username: string, password: string}): boolean{
  //   let users = this.fileManager.readFile(this.USER_FILE);
  //   console.log("Received login request data:", data);
  //   console.log("Username:", data.username);
  //   console.log("Password:", data.password);


  //   console.log(`Login Attempt for ${data.username}`)
  //   console.log(users)
  //   for (let i = 0; i < users.length; i++){
  //     if(users[i]["username"] === data.username){
  //       console.log("Password: " , users[i]["password"] , "\t" , data.password)
  //       if(users[i]["password"] == data.password){
  //         return true;
  //       }
  //       console.log(`Incorrect Password Provided for ${data.username}`);
  //       return false;
  //     }
  //   }

  //   console.log(`${data.username} not found`);
  //   return false;
  // }

  //public async checkLogin(data:{username: string, password: string}): Promise<boolean>{
  // public checkLogin(data:{username: string, password: string}): boolean{
  //   let users = this.fileManager.readFile(this.USER_FILE);
  //   console.log("Received login request data:", data);
  //   console.log("Username:", data.username);
  //   console.log("Password:", data.password);


  //   console.log(`Login Attempt for ${data.username}`)
  //   console.log(users)
  //   for (let i = 0; i < users.length; i++){
  //     if(users[i]["username"] === data.username){
  //       console.log("Password: " , users[i]["password"] , "\t" , data.password)
  //       if(users[i]["password"] == data.password){
  //         return true;
  //       }
  //       console.log(`Incorrect Password Provided for ${data.username}`);
  //       return false;
  //     }
  //   }

  //   console.log(`${data.username} not found`);
  //   return false;
  // }

  public async checkLogin(data: { username: string, password: string }): Promise<boolean> {
    let users = this.fileManager.readFile(this.USER_FILE);
  
    console.log(`Login Attempt for ${data.username}`);
  
    for (let i = 0; i < users.length; i++) {
      if (users[i]["username"] === data.username) {
        console.log("Stored Hash:", users[i]["password"]);
        console.log("Entered Password:", data.password);
  
        // Verify the plaintext password against the stored hash
        const match = await bcrypt.compare(data.password, users[i]["password"]);
        // let match = false;

        // if(users[i]["password"] == data.password){
        //   match = true;
        // }

        if (match) {
          console.log("Password correct!");
          return true;
        } else {
          console.log("Incorrect password!");
          return false;
        }
      }
    }
  
    console.log(`${data.username} not found`);
    return false;
  }


  

  public isAdmin(data:{apiKey: string}): boolean{

    let admin:boolean = false;

    jwt.verify(data.apiKey, KEY, (err, decoded) => {
      if (err) {
        console.log("Token is invalid");
      } else if(typeof decoded === "object" && decoded !== null && "admin" in decoded){
          console.log("\x1b[31m-------------------Admin Token Used-------------------\x1b[0m");
          console.log(decoded);
          admin =  true;
      }
    });

    return admin;
    
  }

}

export default {AuthenticationHandler, AuthorizationHandler}
