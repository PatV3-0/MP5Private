import { describe, it, expect } from '@jest/globals';
import { User, fetchData } from '../src/exp/index'; // Importing User and fetchData directly

describe('API Integration Tests', () => {
    it('should create a new User and greet correctly', () => {
        const user = new User('John', 30);
        expect(user.greet()).toBe('Hello, my name is John and I am 30 years old.');
    });

    it('should return data from fetchData function', async () => {
        const data = await fetchData();
        expect(data).toBe('Data loaded');
    });
});
