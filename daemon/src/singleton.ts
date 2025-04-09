import * as fs from "fs";
import * as path from "path";

const LOCK_FILE = path.join(__dirname, "daemon.lock");

function is_running(): boolean {
    if (fs.existsSync(LOCK_FILE)) {
        const pid = parseInt(fs.readFileSync(LOCK_FILE, "utf8"), 10);

        if (!isNaN(pid)) {
            try {
                process.kill(pid, 0); // Check if process is running
                return true;
            } catch (err) {
                console.log(err);
                console.warn("Stale lock file detected. Cleaning up...");
                fs.unlinkSync(LOCK_FILE); // Remove stale lock
            }
        }
    }

    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    console.log("Daemon started with PID", process.pid);

    const cleanUp = () => {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
            console.log("Lock file removed.");
        }
    };

    process.on("exit", cleanUp);
    process.on("beforeExit", cleanUp);
    process.on("SIGINT", () => {
        cleanUp();
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        cleanUp();
        process.exit(0);
    });

    return false;
}

export default is_running;
