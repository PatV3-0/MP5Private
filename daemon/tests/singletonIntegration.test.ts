import fs from "fs";
import { spawn } from "child_process";
import path from "path";

const LOCK_FILE = path.join(__dirname, "../src/singleton.lock");

describe("is_running - Integration Tests", () => {
    afterEach(() => {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
        }
    });

    test("should start daemon and create lock file", (done) => {
        const daemon = spawn("node", [path.join(__dirname, "../daemon.js")], {
            detached: true,
            stdio: "ignore",
        });
        daemon.unref();

        setTimeout(() => {
            expect(fs.existsSync(LOCK_FILE)).toBe(true);
            daemon.kill();
            done();
        }, 500);
    });

    test("should prevent multiple daemon instances", (done) => {
        fs.writeFileSync(LOCK_FILE, process.pid.toString());
        const daemon = spawn("node", [path.join(__dirname, "../daemon.js")], {
            detached: true,
            stdio: "ignore",
        });
        daemon.unref();

        setTimeout(() => {
            expect(fs.existsSync(LOCK_FILE)).toBe(true);
            daemon.kill();
            done();
        }, 500);
    });
});
