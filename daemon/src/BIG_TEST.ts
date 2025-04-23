/* Aggregate testing file
import * as net from 'net';
import FileManager from "./FileManager.js"; 
//import { AuthenticationHandler, AuthorizationHandler } from './Auth'; 

console.log("\x1b[31m---------- Starting Daemon Communicaiton Tests ----------")
console.log("\t\x1b[32mConnection Test")
testDaemon("test", null);
// console.log("\t\x1b[32mRegistration Test")
// regtest("testUser", "testPass", "test@example.com", "a", "b");
// regtest("testUser", "testPass", "test@example.com", "c", "d");
// regtest("testUser2", "testPass2", "test2@example.com", "e", "f");
// sleep(5000);
// logintest("testUser", "testPass");
// logintest("testUser2", "testPass2");
// testDaemon("getPublicDatabases", null);
// console.log("\t\x1b[32mFileManager Test")
// fileMGMtest();
// console.log("\t\x1b[32mJWT Test")
// //Make sure this prints, if it doesn't check the readme
// const KEY = process.env.MP5_SECRET_KEY;
// console.log("==KEY==");
// console.log(KEY);
// console.log("=======");
// JWTtest(0, "user1", "mail", false);
// JWTtest(1, "testUser", "test@example.com", false);
// JWTtest(2, "user2", "mail2", true);
// JWTverify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjAsInVzZXJuYW1lIjoidXNlcjEiLCJlbWFpbCI6Im1haWwiLCJhZG1pbiI6ZmFsc2UsImRhdGUiOjE3NDEzODU5MzYwMDIsImlhdCI6MTc0MTM4NTkzNiwiZXhwIjoxNzQxNTU4NzM2fQ.ln8BrHUXzx_TQfJ0_Ioyg14t811o4SwWS6RubrYJ50c");
// JWTadmin("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoidXNlcjIiLCJlbWFpbCI6Im1haWwyIiwiYWRtaW4iOnRydWUsImRhdGUiOjE3NDEzODYwNDgxNzIsImlhdCI6MTc0MTM4NjA0OCwiZXhwIjoxNzQxNTU4ODQ4fQ.ONCiZVOXX-sCSsIUUcAG6ThkyLV1mpd_BWN4F4rDp9c");

// let user1Key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoidGVzdFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhZG1pbiI6ZmFsc2UsImRhdGUiOjE3NDE0NDQ5MjM1NzIsImlhdCI6MTc0MTQ0NDkyMywiZXhwIjoxNzQxNjE3NzIzfQ.i4P3qeaojaqS07v6SO4OQXM9IiMUYerXL2BqcZvWPTE";
// const pl = {
//   apiKey: user1Key,
//   dbName: "space test"
// }
// testDaemon("createDatabase", pl);
// testDaemon("getDatabases", pl);

// const cpl = {
//   apiKey: user1Key,
//   databaseID: 1001,
//   operation: "Create",
//   collectionName: "new_collection"
// }
// testDaemon("manageDatabase", cpl)
// testDaemon("manageDatabase", cpl) //dupe test

// const addDoc = {
//   apiKey: user1Key,
//   databaseID: 1001,
//   operation: "Add",
//   collectionName: "new_collection",
//   documentData: {
//       name: "whatsupdoc",
//       key : "value",
//       anotherKey : "anotherValue"
//   }
// }
// testDaemon("manageDatabase", addDoc)

// const addDoc2 = {
//   apiKey: user1Key,
//   databaseID: 1001,
//   operation: "Add",
//   collectionName: "new_collection",
//   documentData: {
//       name: "They're taking the hobbits to Isengard!",
//       hobbit : ["Frodo", "Sam", "Merry", "Pippin"]
//   }
// }
// testDaemon("manageDatabase", addDoc2)

// const updateDoc = {
//   apiKey: user1Key,
//   databaseID: 1001,
//   operation: "Add",
//   collectionName: "new_collection",
//   documentData: {
//       name: "They're taking the hobbits to Isengard!",
//       hobbit : ["Frodo", "Sam", "Merry", "Pippin"]
//   }
// }
// testDaemon("manageDatabase", addDoc2)

// const Doc3 = {
//   apiKey: user1Key,
//   databaseID: 1001,
//   operation: "Add",
//   collectionName: "new_collection",
//   documentData: {
//       name: "Orginal Name",
//       value : "Some original vale"
//   }
// }
// testDaemon("manageDatabase", Doc3)

// const alterDoc3 = {
//   apiKey: user1Key,
//   databaseID: 1001,
//   operation: "Update",
//   collectionName: "new_collection",
//   documentID: "000003",
//   documentData: {
//       value : "Some altered vale"
//   }
// }
// testDaemon("manageDatabase", alterDoc3)

//load unload share unshare
async function testOutput(){
  const loginData = await testLogin("testUser2", "testPass2");
  console.log(loginData);
  let key = loginData["apiKey"];

let pld = {apiKey: key, userID: "000002"} 
testDaemon("getUser", pld);

let upld =  {apiKey: key, userID: "000002", userData: {name: "coolNewName"}}
testDaemon("updateUser", upld);
}
testOutput();
    // JWTtest(1, "testUser", "test@example.com");
    // testLoadDatabase("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoidGVzdFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhZG1pbiI6ZmFsc2UsImRhdGUiOjE3NDM5NTYyNTU1MTEsImlhdCI6MTc0Mzk1NjI1NSwiZXhwIjoxNzQ0MTI5MDU1fQ.f4zKksEfmrLFlLgBYg6HZoq3fQRg88DbcCaUqf3Ogww");
    // testUnloadDatabase("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoidGVzdFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhZG1pbiI6ZmFsc2UsImRhdGUiOjE3NDM5NTYyNTU1MTEsImlhdCI6MTc0Mzk1NjI1NSwiZXhwIjoxNzQ0MTI5MDU1fQ.f4zKksEfmrLFlLgBYg6HZoq3fQRg88DbcCaUqf3Ogww");
    // testShareDatabase("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoidGVzdFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhZG1pbiI6ZmFsc2UsImRhdGUiOjE3NDM5NTYyNTU1MTEsImlhdCI6MTc0Mzk1NjI1NSwiZXhwIjoxNzQ0MTI5MDU1fQ.f4zKksEfmrLFlLgBYg6HZoq3fQRg88DbcCaUqf3Ogww");
    //testUnshareDatabase("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoidGVzdFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJhZG1pbiI6ZmFsc2UsImRhdGUiOjE3NDM5NTYyNTU1MTEsImlhdCI6MTc0Mzk1NjI1NSwiZXhwIjoxNzQ0MTI5MDU1fQ.f4zKksEfmrLFlLgBYg6HZoq3fQRg88DbcCaUqf3Ogww");


//=============================================================================================================================================================================================
async function regtest(usn, pswd, mail, nme, sme){    
    const payload = {
            username: usn,
            password: pswd,
            email: mail,
            name: nme,
            surname: sme
        }

    testDaemon("register", payload);
}

async function logintest(usn, pswd){    
  const payload = {
          username: usn,
          password: pswd
      }

  testDaemon("login", payload);
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testDaemon(action, data){
  return new Promise((resolve) => {
    const client = new net.Socket();
    const PORT = 5000;
    const HOST = '0.0.0.0'; 

    const request = {
        action: action,
        payload: data
      };
      
      client.connect(PORT, HOST, () => {
        console.log(`Connected to daemon on ${HOST}:${PORT}`);
        client.write(JSON.stringify(request));
        //sleep(5000); //sleep for 5 seconds
      });
      
      
      client.on('data', (data) => {
        try {
          const response = JSON.parse(data.toString());
          console.log('Response from daemon:', response);
          resolve(response.data);
          
        } catch (error) {
          console.log('Error parsing response', error);
        }
        client.destroy(); 
      });
      
      
      client.on('error', (err) => {
        console.error('Connection error:', err);
      });
    });
  }

async function fileMGMtest(){
const fileManager = new FileManager();

fileManager.createFile('users/test', [{ _id: 0, name: 'Justin' }]);
console.log(fileManager.readFile('users/test'));

fileManager.appendToCollection('users/test',"email", "e@mail.com", 0);
console.log(fileManager.readFile('users/test'));


let user = fileManager.readFile('users/test');
user[0] = 'Toast@mail.com';
console.log(fileManager.readFile('users/test'));

// fileManager.updateFile('users/test', user);
// console.log(fileManager.readFile('users/test'));

// Should throw and error
// fileManager.deleteFile('users/test');
// console.log(fileManager.readFile('users/test'));

//Make sure there's atleast 2 users registered in users.json before running this
let userFile = fileManager.readFile("users");
console.log("User id Read: " + userFile[0]._id);
console.log("Username Read: " + userFile[1].username);
}

async function JWTtest(id:number, usn:string, em:string){
  const payload = {
    _id: id,
    username: usn,
    email: em,
}

  return testDaemon("getAPIkey", payload);
}

function JWTverify(key:string){
  const payload = {
    apiKey: key,
}

  testDaemon("verifyJWT", payload);
}

function JWTadmin(key:string){
  const payload = {
    apiKey: key,
}

  testDaemon("isAdmin", payload);
}

async function testLogin(usn, pss) {
  const data =  await testDaemon('login', {
      username: usn,  
      password: pss   
  });

  //console.log("abcd")
  //console.log(data)
  return data;
}

function testLoadDatabase(jwt) {
  testDaemon('loadDatabase', {
      apiKey: jwt,  // Replace with actual JWT from login
      databaseID: '1001'              // Replace with actual database ID
  });
}

function testUnloadDatabase(jwt) {
  testDaemon('unloadDatabase', {
      apiKey: jwt,  // Replace with actual JWT from login
      databaseID: '1001'              // Replace with actual database ID
  });
}

function testShareDatabase(jwt) {
  testDaemon('shareDatabase', {
      apiKey: jwt,  // Replace with actual JWT from login
      databaseID: '1001',             // Replace with actual database ID
      targetUsername: 'testUser2',    // Replace with username to share with
      permissionType: 'read'          // Can be 'read' or 'write'
  });
}

function testUnshareDatabase(jwt) {
  testDaemon('unshareDatabase', {
      apiKey: jwt,  // Replace with actual JWT from login
      databaseID: '1001',             // Replace with actual database ID
      targetUsername: 'testUser2',    // Replace with username to unshare from
      permissionType: 'read'          // Can be 'read' or 'write'
  });
}




function testUpdateUser(jwt, uid, usedata) {
  testDaemon('updateUser', {
        apiKey: jwt,  
        userID: uid,    
        userData: {                    
            name: usedata.name,
            email: usedata.email,
            profileImage: usedata.pfp
        }
    });
}

function testGetUser(jwt, uid) {
    testDaemon('getUser', {
        apiKey: jwt, 
        userID: uid        
    });
}*/