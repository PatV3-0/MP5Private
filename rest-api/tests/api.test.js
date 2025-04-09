import { server, app, sendToDaemon } from "../src/REST_api.js";
import request from "supertest";

// Mock net.Socket to prevent real network connection
// will always return the callback:callback(JSON.stringify({ databases: ["db1", "db2"] })); even with mock resolved or reject values
// may need to change depending on the daemon
jest.mock("net", () => {
    const originalNet = jest.requireActual("net");

    return {
        ...originalNet,
        Socket: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            write: jest.fn(),
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === "data") {
                    callback(JSON.stringify({ databases: ["db1", "db2"] }));
                }
                return this;
            }),
            destroy: jest.fn(),
        })),
    };
});

jest.mock("../src/REST_api.js", () => {
    const originalModule = jest.requireActual("../src/REST_api");
    return {
        ...originalModule,
        sendToDaemon: jest.fn(),
    };
});
afterEach(() => {
    jest.clearAllMocks();
});

afterAll((done) => {
    server.close(done);
});

describe("PUT /updateUser", () => {
    it("should return 400 if the json body is empty", async() => {
        const response = await request(app).put("/updateUser").send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("JSON body empty")
    });

    it("should return 400 if userId is missing", async() => {
        const response = await request(app).put("/updateUser").send({userData: {data: "someData"}});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey or userID or userData is missing");
    });
    it("should return 400 if userData is missing", async() => {
        const response = await request(app).put("/updateUser").send({userID: 1});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey or userID or userData is missing");
    });
    it("should return 400 if apiKey is missing", async() => {
        const response = await request(app).put("/updateUser").send({userID: 1, userData: {data: "someData"}});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey or userID or userData is missing");
    });
    it("should return 200 if update is successful", async() => {
        const mockDaemonResponse = {message: "Successfully updated"};
        sendToDaemon.mockResolvedValue(mockDaemonResponse);

        const response = await request(app).put("/updateUser").send({apiKey: "someKey", userID: 1, userData: {data: "someData"}});
        expect(response.status).toBe(200);
    })
}); 
describe("GET /publicDatabase", () => {
    it("should return 200 and the public databases when valid request is sent", async () => {
        
        const mockResponse = { databases: ["db1", "db2"] };
        sendToDaemon.mockResolvedValue(mockResponse);
        const response = await request(app)
            .get("/publicDatabase?limit=10&offset=0"); 

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if limit is missing", async () => {
        const response = await request(app)
            .get("/publicDatabase?limit=10");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("limit or offset missing");
    });
    it("should return 400 if  offset is missing", async () => {
        const response = await request(app)
            .get("/publicDatabase?offset=2");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("limit or offset missing");
    });
});
describe("POST /getDatabases" , () => {
    it("should return 200 and the user databases when valid request is sent", async () => {
        
        const mockResponse = { databases: ["db1", "db2"] };
        sendToDaemon.mockResolvedValue(mockResponse);
        const response = await request(app)
            .post("/databases").send({apiKey: "someKey"});

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if nothing is sent", async () => {
        const response = await request(app)
            .post("/databases").send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("JSON body empty");
    });
    it("should return 400 if apiKey is missing", async () => {
        const response = await request(app)
            .post("/databases").send({data: "invalid data"});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey missing");
    });
})


//------------------------------Ibrahim endpoint test----------------------------------
describe("POST /login", () => {
    it("should return 200 and a token if login is successful", async () => {
        const mockResponse = { token: "validToken" };
        sendToDaemon.mockResolvedValue(mockResponse);

        const response = await request(app).post("/login").send({ username: "user1", password: "pass123" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if username or password is missing", async () => {
        const response = await request(app).post("/login").send({ username: "user1" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Username or password missing");
    });
});

describe("POST /register", () => {
    it("should return 201 if registration is successful", async () => {
        const mockResponse = { message: "User registered successfully" };
        sendToDaemon.mockResolvedValue(mockResponse);

        const response = await request(app).post("/register").send({ username: "newUser", name:"userrr" , surname: "usersurname" , email: "userEmail111@gmail.com" ,password: "newPass"});

        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if username or password is missing", async () => {
        const response = await request(app).post("/register").send({ username: "newUser" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Username or password missing");
    });
});

describe("POST /getAPIKey", () => {
    it("should return 200 and API key response if request is successful", async () => {
        const mockResponse = { apiKey: "validAPIKey123" };
        sendToDaemon.mockResolvedValue(mockResponse);

        const response = await request(app)
            .post("/getAPIKey")
            .send({ 
                payload: {
                    username: "user1",
                    password: "pass123",
                    email: "user1@example.com"
                }
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if required fields are missing", async () => {
        const response = await request(app)
            .post("/getAPIKey")
            .send({ 
                payload: {
                    username: "user1",
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Missing fields required for generating API key");
    });

    it("should return 500 if daemon communication fails", async () => {
        sendToDaemon.mockRejectedValue(new Error("Daemon error"));

        const response = await request(app)
            .post("/getAPIKey")
            .send({ 
                payload: {
                    username: "user1",
                    password: "pass123",
                    email: "user1@example.com"
                }
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to communicate with daemon");
    });
});

describe("POST /revokeAPIKey", () => {
    it("should return 200 if API key revocation is successful", async () => {
        const mockLoginResponse = { 
            status: 200, 
            payload: { hashedPass: "hashedPassword123" }
        };
        sendToDaemon.mockResolvedValue(mockLoginResponse);
        bcrypt.compare.mockResolvedValue(true);
        jwt.verify.mockReturnValue({}); // Mock valid JWT verification

        const response = await request(app)
            .post("/revokeAPIKey")
            .send({ 
                username: "user1",
                password: "pass123",
                api_key: "validApiKey"
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 200,
            message: "API key successfully revoked."
        });
    });

    it("should return 400 if login credentials are invalid", async () => {
        const mockLoginResponse = { status: 401 };
        sendToDaemon.mockResolvedValue(mockLoginResponse);

        const response = await request(app)
            .post("/revokeAPIKey")
            .send({ 
                username: "user1",
                password: "pass123",
                api_key: "validApiKey"
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid username or password, please try again.");
    });

    it("should return 400 if password is incorrect", async () => {
        const mockLoginResponse = { 
            status: 200, 
            payload: { hashedPass: "hashedPassword123" }
        };
        sendToDaemon.mockResolvedValue(mockLoginResponse);
        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
            .post("/revokeAPIKey")
            .send({ 
                username: "user1",
                password: "wrongpass",
                api_key: "validApiKey"
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Password incorrect. Please try again.");
    });

    it("should return 500 if daemon communication fails", async () => {
        sendToDaemon.mockRejectedValue(new Error("Daemon error"));

        const response = await request(app)
            .post("/revokeAPIKey")
            .send({ 
                username: "user1",
                password: "pass123",
                api_key: "validApiKey"
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to revoke the API key.");
    });
});