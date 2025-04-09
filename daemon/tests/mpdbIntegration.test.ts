import { Daemon } from "../src/mpdbd";
import * as net from "net";

// Mock process.exit to prevent the test from exiting
jest.spyOn(process, 'exit').mockImplementation(((code?: number | string) => {}) as never);

// Mock is_running to return false (not running)
jest.mock('../src/singleton.js', () => ({
    default: jest.fn(() => false) // Simulate the daemon is not running
}));

describe("Daemon Integration Tests", () => {
    let daemon: Daemon;
    let client: net.Socket;

    beforeAll(() => {
        daemon = new Daemon(5001);
        daemon.start();
    });

    afterAll(() => {
        daemon["server"].close();
    });

    test("should allow a client to connect", (done) => {
        client = new net.Socket();
        client.connect(5001, "127.0.0.1", () => {
            expect(client).toBeDefined();
            client.destroy();
            done();
        });
    });

    test("should receive a response from the server", (done) => {
        client = new net.Socket();
        client.connect(5001, "127.0.0.1", () => {
            client.write("Test request");

            client.on("data", (data) => {
                expect(data.toString()).toContain("Expected Response");
                client.destroy();
                done();
            });
        });
    });
});
