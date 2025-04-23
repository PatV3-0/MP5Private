import * as net from 'net';

async function testDaemon(action, data){
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
          return response.data;
          
        } catch (error) {
          console.log('Error parsing response', error);
        }
        client.destroy(); 
      });
      
      
      client.on('error', (err) => {
        console.error('Connection error:', err);
      });
}

async function logintest(usn, pswd){    
  const payload = {
          username: usn,
          password: pswd
      }

  testDaemon("login", payload);
}

//   testDaemon('login', {
//       username: 'testUser',  // Replace with actual username
//       password: 'testPass'   // Replace with actual password
//   });

  // testDaemon ( 'register', {
  //   username: "yesno",
  //   password: "Password123",
  //   email: "123456@gmail.com",
  //   name: "Ronan",
  //   surname: "smart"
  // })

//   testDaemon('login', {
//     username: 'yesno',  // Replace with actual username
//     password: 'Password123'  // Replace with actual password
// });

// testDaemon('getAPIkey', {
//     _id: 1,
//     username: "yesno",
//     email: "123456@gmail.com"
// });

testDaemon("getPublicDatabases", "");