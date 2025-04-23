import { describe, it, expect } from '@jest/globals';
import { Response, Request } from '../src/ResponseRequestInterface';

describe('Response Interface', () => {
    it('should create a valid response object', () => {
        const res: Response = {
            status: 200,
            message: "Success",
            data: { user: "TestUser" }
        };
        expect(res.status).toBe(200);
        expect(res.message).toBe("Success");
        expect(res.data).toEqual({ user: "TestUser" });
    });
});

describe('Request Interface', () => {
    it('should create a valid request object', () => {
        const req: Request = {
            action: "fetchData",
            payload: { id: 1 }
        };
        expect(req.action).toBe("fetchData");
        expect(req.payload).toEqual({ id: 1 });
    });

    it('should allow optional payload', () => {
        const req: Request = { action: "ping" };
        expect(req.action).toBe("ping");
        expect(req.payload).toBeUndefined();
    });
});
