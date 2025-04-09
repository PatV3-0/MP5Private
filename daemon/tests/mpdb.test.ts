import { Daemon } from "../src/mpdbd";
//import { AuthorizationHandler } from "../src/Auth";
import * as net from "net";

jest.mock("../src/Auth"); // Mock authentication/authorization

describe("Daemon Class", () => {
    let daemon: Daemon;
    
    beforeEach(() => {
        daemon = new Daemon(5000);
    });

    test("should initialize with correct port", () => {
        expect(daemon).toBeDefined();
    });

    test("should start the server", () => {
        jest.spyOn(console, "error").mockImplementation(() => {});
        // jest.spyOn(process, "exit").mockImplementation(() => {});

        daemon.start();
        expect(console.error).not.toHaveBeenCalled();
    });

    test("should handle incoming connections", () => {
        const mockSocket = new net.Socket();
        jest.spyOn(mockSocket, "write");

        daemon["handleConnection"](mockSocket);
        expect(mockSocket.write).toHaveBeenCalled();
    });
});
