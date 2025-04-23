#!/usr/bin/env node
import {Command} from "commander";
import { spawn } from "child_process";
import { exec } from "child_process";
import { readFileSync, existsSync, unlinkSync} from "fs";
import * as net from "net";

const program = new Command();
const PID_FILE = "../../daemon/src/daemon.lock";
const PORT = 5000;

program
    .name("mycli")
    .description("A CLI to interact with the daemon")
    .version("1.0.0");

program
    .command("start")
    .description("start the daemon")
    .action(()=>{

        console.log("starting daemon");

        const daemon = spawn("npx",["tsx","../../daemon/src/mpdbd.ts"],{

            stdio: "inherit",
            shell: true,

        });

        daemon.on("close", (code)=>{
            console.log(`Daemon has exited with code ${code}`);
        })

    });

program
    .command("status")
    .description("check daemon status")
    .action(() =>{

       if(existsSync(PID_FILE)){
        const pid = readFileSync(PID_FILE,"utf-8").trim();
        console.log(`daemon is running (PID: ${pid})`);
       }
       else{
        console.log("daemon is not running");
       }

    })

program
    .command("stop")
    .description("stops the daemon")
    .action(() =>{

        if (!existsSync(PID_FILE)) {
            console.log("❌ Daemon is not running.");
            return;
          }
      
          const pid = readFileSync(PID_FILE, "utf-8").trim();
          //console.log(pid);
          const killCommand = process.platform === "win32" ? `taskkill /PID ${pid} /F` : `kill ${pid}`;
          console.log(killCommand);
      

        exec(killCommand, (error, stdout, stderr)=>{
            if(error){
                console.log("failed to stop daemon: ",stderr);
            }
            else{
                console.log("Daemon stoped successfully.");
                unlinkSync(PID_FILE);
            }
        })

    });
    

    program 
      .command("register")
      .description("register user")
      .option("--payload <payload>", "Payload to be sent with the request")
      .action(async (cmd) => {
        const {payload} = cmd;
    
        if (!payload) {
          console.error("Action and payload are required.");
          return;
        }
    
        const client = new net.Socket();
    
        client.connect(5000, "localhost", () => {
          const request = {
            action:"register",
            payload: JSON.parse(payload)
          };
    
          client.write(JSON.stringify(request)); 
        });
    
        client.on("data", (data) => {
          console.log("Received:", data.toString());
          client.destroy();
        });
    
        client.on("error", (err) => {
          console.error("Error:", err);
        });
      });




    program
      .command("send-request")
      .description("Send request to the daemon")
      .option("--action <action>", "Action to be performed")
      .option("--payload <payload>", "Payload to be sent with the request")
      .action(async (cmd) => {
        const { action, payload } = cmd;
    
        if (!action || !payload) {
          console.error("Action and payload are required.");
          return;
        }
    
        const client = new net.Socket();
    
        client.connect(5000, "localhost", () => {
          const request = {
            action:action,
            payload: JSON.parse(payload) // Parse the stringified JSON payload
          };
    
          client.write(JSON.stringify(request)); // Send the request to the daemon
        });
    
        client.on("data", (data) => {
          console.log("Received:", data.toString());
          client.destroy();
        });
    
        client.on("error", (err) => {
          console.error("Error:", err);
        });
      });
    
program.parse(process.argv);
#!/usr/bin/env node
import {Command} from "commander";
import { spawn } from "child_process";
import { exec } from "child_process";
import { readFileSync, existsSync, unlinkSync} from "fs";
import * as net from "net";

const program = new Command();
const PID_FILE = "../../daemon/src/daemon.lock";
const PORT = 5000;

program
    .name("mycli")
    .description("A CLI to interact with the daemon")
    .version("1.0.0");

program
    .command("start")
    .description("start the daemon")
    .action(()=>{

        console.log("starting daemon");

        const daemon = spawn("npx",["tsx","../../daemon/src/mpdbd.ts"],{

            stdio: "inherit",
            shell: true,

        });

        daemon.on("close", (code)=>{
            console.log(`Daemon has exited with code ${code}`);
        })

    });

program
    .command("status")
    .description("check daemon status")
    .action(() =>{

       if(existsSync(PID_FILE)){
        const pid = readFileSync(PID_FILE,"utf-8").trim();
        console.log(`daemon is running (PID: ${pid})`);
       }
       else{
        console.log("daemon is not running");
       }

    })

program
    .command("stop")
    .description("stops the daemon")
    .action(() =>{

        if (!existsSync(PID_FILE)) {
            console.log("❌ Daemon is not running.");
            return;
          }
      
          const pid = readFileSync(PID_FILE, "utf-8").trim();
          //console.log(pid);
          const killCommand = process.platform === "win32" ? `taskkill /PID ${pid} /F` : `kill ${pid}`;
          console.log(killCommand);
      

        exec(killCommand, (error, stdout, stderr)=>{
            if(error){
                console.log("failed to stop daemon: ",stderr);
            }
            else{
                console.log("Daemon stoped successfully.");
                unlinkSync(PID_FILE);
            }
        })

    });
    

    program 
      .command("register")
      .description("register user")
      .option("--payload <payload>", "Payload to be sent with the request")
      .action(async (cmd) => {
        const {payload} = cmd;
    
        if (!payload) {
          console.error("Action and payload are required.");
          return;
        }
    
        const client = new net.Socket();
    
        client.connect(5000, "localhost", () => {
          const request = {
            action:"register",
            payload: JSON.parse(payload)
          };
    
          client.write(JSON.stringify(request)); 
        });
    
        client.on("data", (data) => {
          console.log("Received:", data.toString());
          client.destroy();
        });
    
        client.on("error", (err) => {
          console.error("Error:", err);
        });
      });




    program
      .command("send-request")
      .description("Send request to the daemon")
      .option("--action <action>", "Action to be performed")
      .option("--payload <payload>", "Payload to be sent with the request")
      .action(async (cmd) => {
        const { action, payload } = cmd;
    
        if (!action || !payload) {
          console.error("Action and payload are required.");
          return;
        }
    
        const client = new net.Socket();
    
        client.connect(5000, "localhost", () => {
          const request = {
            action:action,
            payload: JSON.parse(payload) // Parse the stringified JSON payload
          };
    
          client.write(JSON.stringify(request)); // Send the request to the daemon
        });
    
        client.on("data", (data) => {
          console.log("Received:", data.toString());
          client.destroy();
        });
    
        client.on("error", (err) => {
          console.error("Error:", err);
        });
      });
    
program.parse(process.argv);