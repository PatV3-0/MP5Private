import FileManager from '../src/FileManager';
import * as fs from 'fs';
import * as path from 'path';

describe('FileManager - Integration Tests', () => {
    let fileManager: FileManager;
    const testDir = 'test_data';
    const testFile = path.join(testDir, 'test.json');

    beforeEach(() => {
        fileManager = new FileManager();
        fs.mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        if (fs.existsSync(testDir)) fs.rmdirSync(testDir, { recursive: true });
    });

    test('createFile should create a file with initial data', () => {
        const initialData = [{ id: 1, name: "Test" }];
        
        fileManager.createFile(testFile, initialData);
        
        expect(fs.existsSync(testFile)).toBe(true);
        const fileContent = JSON.parse(fs.readFileSync(testFile, 'utf8'));
        expect(fileContent).toEqual(initialData);
    });

    test('readFile should return correct data', () => {
        const initialData = [{ id: 1, name: "Test" }];
        fs.writeFileSync(testFile, JSON.stringify(initialData, null, 2));

        const result = fileManager.readFile(testFile);
        expect(result).toEqual(initialData);
    });

    test('updateFile should correctly update file data', () => {
        const initialData = [{ id: 1, name: "Test" }];
        const updatedData = [{ id: 1, name: "Updated" }];
        fs.writeFileSync(testFile, JSON.stringify(initialData, null, 2));

        fileManager.updateFile(testFile, updatedData);
        
        const fileContent = JSON.parse(fs.readFileSync(testFile, 'utf8'));
        expect(fileContent).toEqual(updatedData);
    });

    test('deleteFile should remove the file', () => {
        fs.writeFileSync(testFile, JSON.stringify([{ id: 1, name: "Test" }], null, 2));

        fileManager.deleteFile(testFile);

        expect(fs.existsSync(testFile)).toBe(false);
    });

    test('appendToCollection should modify an existing object in the file', () => {
        const initialData = [{ _id: 1, name: "Test" }];
        fs.writeFileSync(testFile, JSON.stringify(initialData, null, 2));

        fileManager.appendToCollection(testFile, 'name', 'Updated Value', 1);
        
        const updatedData = JSON.parse(fs.readFileSync(testFile, 'utf8'));
        expect(updatedData).toEqual([{ _id: 1, name: "Updated Value" }]);
    });

    test('appendToFile should add new data to the file', () => {
        const initialData = [{ _id: 1, name: "Test" }];
        const newData = { _id: 2, name: "New Entry" };
        fs.writeFileSync(testFile, JSON.stringify(initialData, null, 2));

        fileManager.appendToFile(testFile, newData);
        
        const updatedData = JSON.parse(fs.readFileSync(testFile, 'utf8'));
        expect(updatedData).toEqual([...initialData, newData]);
    });
});
