import { createApp } from "../../src/REST_api.js";
import request from "supertest";
import bcrypt, { compare } from "bcrypt";
import jwt from "jsonwebtoken"
import { verify } from "crypto";

const mockSendToDaemon = jest.fn();
const app = createApp(mockSendToDaemon);

jest.mock("bcrypt", () => ({
    compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn()
}))

afterEach(() => jest.clearAllMocks());

//---------------------------Sean endpoint test----------------------------------
describe("PUT /updateUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if the json body is empty", async() => {
        const response = await request(app).put("/updateUser").send({});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("JSON body empty")
    });
    it("should return 400 if apiKey is missing", async() => {
        const response = await request(app).put("/updateUser").send({payload: {userID: 1, userData: {data: "someData"}}});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey or userID or userData is missing");
    });
    it("should return 400 if userId is missing", async() => {
        const response = await request(app).put("/updateUser").send({payload: {userData: {apiKey: "someKey", data: "someData"}}});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey or userID or userData is missing");
    });
    it("should return 400 if userData is missing", async() => {
        const response = await request(app).put("/updateUser").send({payload: {apiKey: "someKey", userID: 1}});
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey or userID or userData is missing");
    });
    it("should return 200 if update is successful", async() => {
        const mockDaemonResponse = {message: "Successfully updated"};
        mockSendToDaemon.mockResolvedValue(mockDaemonResponse);

        const response = await request(app).put("/updateUser").send({payload: {apiKey: "someKey", userID: 1, userData: {data: "someData"}}});
        expect(response.status).toBe(200);
    });
    it("should return 500 if daemon fails", async() => {
        mockSendToDaemon.mockRejectedValue(new Error("Daemon error"));

        const response = await request(app).put("/updateUser").send({payload: {apiKey: "someKey", userID: 1, userData: {data: "someData"}}});
        expect(response.status).toBe(500);
        expect(mockSendToDaemon).toHaveBeenCalled();
        expect(response.body).toEqual({ error: "Failed to communicate with daemon" });
    })
}); 
describe("POST /getPublicDatabases", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return 200 and the public databases when valid request is sent", async () => {
        
        const mockResponse = { messages: "Successfully updated" };
        mockSendToDaemon.mockResolvedValue(mockResponse);
        const response = await request(app)
            .post("/getPublicDatabases").send({payload: {limit: 10, offset: 2}}); 
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            
            expect(mockSendToDaemon).toHaveBeenCalledWith({
                action: "getPublicDatabases",
                payload: {
                    limit: 10,
                    offset: 2
                }
            });
    });
    it("should return 400 if limit is missing", async () => {
        const response = await request(app)
            .post("/getPublicDatabases").send({payload: {limit: 10}});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("limit or offset missing");
    });
    it("should return 400 if  offset is missing", async () => {
        const response = await request(app)
            .post("/getPublicDatabases").send({payload: {offset: 2}});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("limit or offset missing");
    });
    it("should return 500 if daemon communication fails", async () => {
        mockSendToDaemon.mockRejectedValue(new Error("Daemon error"));

        const response = await request(app).post("/getPublicDatabases").send({payload: {limit: 10, offset: 2}});

        expect(response.status).toBe(500);
        expect(mockSendToDaemon).toHaveBeenCalled();
        expect(response.body).toEqual({ error: "Failed to communicate with daemon" });
    });
});
describe("POST /getDatabases" , () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 and the user databases when valid request is sent", async () => {
        
        const mockResponse = { databases: ["db1", "db2"] };
        mockSendToDaemon.mockResolvedValue(mockResponse);
        const response = await request(app)
            .post("/getDatabases").send({payload: {apiKey: "someKey"}});

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if nothing is sent", async () => {
        const response = await request(app)
            .post("/getDatabases").send({});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("JSON body empty");
    });
    it("should return 400 if apiKey is missing", async () => {
        const response = await request(app)
            .post("/getDatabases").send({payload: {data: "invalid data"}});

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("apiKey missing");
    });
});

//------------------------------Ibrahim endpoint test----------------------------------
describe("POST /login", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return 200 and a token if login is successful", async () => {
        const mockResponse = { status: 200 };
        mockSendToDaemon.mockResolvedValue(mockResponse);

        const response = await request(app).post("/login").send({payload: { username: "user1", password: "pass123" }});

        expect(response.status).toBe(200);
        expect(response.body.message).toEqual("You have successfully logged in!");
    });

    it("should return 400 if username or password is missing", async () => {
        const response = await request(app).post("/login").send({payload: { username: "user1" }});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Username or password is missing in the request body.");
    });
});

describe("POST /register", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return 200 if registration is successful", async () => {
        const mockResponse = { status: 200, message: "User registered successfully" };
        mockSendToDaemon.mockResolvedValue(mockResponse);

        const response = await request(app).post("/register").send({payload: { username: "newUser", name:"userrr" , surname: "usersurname" , email: "userEmail111@gmail.com" ,password: "newPass"}});

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResponse);
    });

    it("should return 400 if username or password is missing", async () => {
        const response = await request(app).post("/register").send({payload: { username: "newUser" }});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("User registration failed, please try again.");
    });
});

describe("POST /getAPIKey", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return 200 and API key response if request is successful", async () => {
        const mockResponse = { apiKey: "validAPIKey123" };
        mockSendToDaemon.mockResolvedValue(mockResponse);

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
        mockSendToDaemon.mockRejectedValue(new Error("Daemon error"));

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
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return 200 if API key revocation is successful", async () => {
        const mockLoginResponse = { 
            status: 200, 
            payload: { hashedPass: "hashedPassword123" }
        };
        mockSendToDaemon.mockResolvedValue(mockLoginResponse);
        bcrypt.compare.mockResolvedValue(true);
        jwt.verify.mockReturnValue({}); // Mock valid JWT verification

        const response = await request(app)
            .post("/revokeAPIKey")
            .send({ 
                username: "user1",
                password: "pass123",
                api_key: "validApiKey"
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            status: 200,
            message: "API key successfully revoked."
        });
    });

    it("should return 400 if login credentials are invalid", async () => {
        const mockLoginResponse = { status: 401 };
        mockSendToDaemon.mockResolvedValue(mockLoginResponse);

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
        mockSendToDaemon.mockResolvedValue(mockLoginResponse);
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
        mockSendToDaemon.mockRejectedValue(new Error("Daemon error"));

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