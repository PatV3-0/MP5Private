import {jest} from '@jest/globals';
import fs from 'fs';
//Testing updated pipeline
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {AuthenticationHandler} from '../src/Auth';

describe('AuthenticationHandler Unit Tests', () => {
    let authHandler;

    beforeEach(() => {
        authHandler = new AuthenticationHandler();
        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({users: []}));
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('registerUser should add a new user when username is unique', () => {
        jest.spyOn(authHandler.fileManager, 'readFile').mockReturnValue([]);
        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

        const user = {
            username: 'testUser',
            password: 'password1234',
            email: 'test@example.com',
            name: 'Test',
            surname: 'User',
        };

        expect(authHandler.registerUser(user)).toBe(true);
    });

    test('registerUser should not add a new user when username already exits', () => {
        jest.spyOn(authHandler.fileManager, 'readFile').mockReturnValue([{ username: 'testUser' }]);

        const user = {
            username: 'testUser',
            password: 'password1234',
            email: 'test@example.com',
            name: 'Test',
            surname: 'User',
        };

        expect(authHandler.registerUser(user)).toBe(false);
    });

    test('generateAPIkey should return a valid JWT token', () => {
        const user = {_id: 1, username: 'testUser', email: 'test@example.com'};
        const token = authHandler.generateAPIkey(user);

        expect(typeof token).toBe('string');
    })
})