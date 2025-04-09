import * as net from 'net';

const client = new net.Socket();
const PORT = 5000;
const HOST = '127.0.0.1'; 

const request = {
  action: 'test'
};

client.connect(PORT, HOST, () => {
  console.log(`Connected to daemon on ${HOST}:${PORT}`);
  client.write(JSON.stringify(request));
});


client.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('Response from daemon:', response);
    sleep(5000); //sleep for 5 seconds
  } catch (error) {
    console.error('Error parsing response:', error);
  }
  client.destroy(); 
});


client.on('error', (err) => {
  console.error('Connection error:', err);
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
