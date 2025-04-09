import { AuthenticationHandler, AuthorizationHandler } from '../AuthenticationHandler.js';

describe('Authentication & Authorization Integration Tests', () => {
    let authHandler;
    let authzHandler;
    let testUser;
    
    beforeAll(() => {
        authHandler = new AuthenticationHandler();
        authzHandler = new AuthorizationHandler();
        testUser = {
            username: 'testUser',
            password: 'password123',
            email: 'test@example.com',
            name: 'Test',
            surname: 'User'
        };
        authHandler.registerUser(testUser);
    });
    
    test('loginUser should return true for valid credentials', async () => {
        const loginData = { username: 'testUser', password: 'password123' };
        const result = await authHandler.loginUser(loginData);
        expect(result).toBe(true);
    });

    test('verifyJWTIntegrity should return true for a valid token', () => {
        const token = authHandler.generateAPIkey({ _id: 1, username: 'testUser', email: 'test@example.com' });
        const isValid = authzHandler.verifyJWTIntegrity({ apiKey: token });
        expect(isValid).toBe(true);
    });
});
