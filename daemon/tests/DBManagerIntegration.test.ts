import fs from 'fs';
import DatabaseManager from '../src/DatabaseManager';
import path from 'path';

const testDbFile = path.join(__dirname, '__tests__/testdb.json');

describe('DatabaseManager Integration Tests', () => {
    let dbManager: DatabaseManager<{ _id: number, name: string }>;


    beforeEach(() => {
        // Ensure the directory exists
        const dir = path.dirname(testDbFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Ensure test file is clean
        fs.writeFileSync(testDbFile, JSON.stringify([]), 'utf-8');
        dbManager = new DatabaseManager<{ _id: number, name: string }>(testDbFile);
    });

    afterEach(() => {
        // Cleanup test file
        if (fs.existsSync(testDbFile)) {
            fs.unlinkSync(testDbFile);
        }
    });

    test('should create and retrieve a record', async () => {
        const item = { _id: 1, name: 'Integration Test' };
        await dbManager.create(item);

        const allRecords = await dbManager.readAll();
        expect(allRecords).toEqual([item]);

        const found = await dbManager.readById(1);
        expect(found).toEqual(item);
    });

    test('should update an existing record', async () => {
        await dbManager.create({ _id: 1, name: 'Old Name' });
        await dbManager.update(1, { name: 'New Name' });

        const updatedRecord = await dbManager.readById(1);
        expect(updatedRecord).toEqual({ _id: 1, name: 'New Name' });
    });

    test('should delete a record', async () => {
        await dbManager.create({ _id: 1, name: 'To Be Deleted' });

        const deleteResult = dbManager.delete(1);
        expect(deleteResult).toBe(true);

        const allRecords = await dbManager.readAll();
        expect(allRecords).toEqual([]);
    });

    test('should return false when deleting non-existent record', () => {
        const result = dbManager.delete(99);
        expect(result).toBe(false);
    });
});
