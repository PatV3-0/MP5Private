<<<<<<< Updated upstream
import DatabaseManager from './../src/DatabaseManager';
//import FileManager from './../src/FileManager';

// Create a temporary file for testing
const testFilePath = 'test_db.json';
//fs.writeFileSync(testFilePath, JSON.stringify([]), 'utf-8');

// Define a sample data type
interface User {
    _id: number;
    name: string;
    email: string;
}

// Initialize the database manager
const db = new DatabaseManager<User>(testFilePath);

async function runTests() {
    console.log("Running manual tests...");

    // Create users
    try {
        const user1 = await db.create({ _id: 1, name: "Alice", email: "alice@example.com" });
        console.log("Create user 1:", user1);
    } catch (error) {
        console.error("Error creating user 1:", error);
    }

    try {
        const user2 = await db.create({ _id: 2, name: "Bob", email: "bob@example.com" });
        console.log("Create user 2:", user2);
    } catch (error) {
        console.error("Error creating user 2:", error);
    }

    // Read all users
    const allUsers = await db.readAll();
    console.log("All users:", allUsers);

    // Read a user by ID
    const userById = await db.readById(1);
    console.log("User with ID 1:", userById);

    // Update a user
    const updatedUser = await db.update(1, { name: "Alice Updated" });
    console.log("Updated user 1:", updatedUser);

    // Attempt to update a non-existent user
    const nonExistentUpdate = await db.update(3, { name: "Charlie" });
    console.log("Updating non-existent user:", nonExistentUpdate);

    // Delete a user
    const deleteSuccess = db.delete(2);
    console.log("Delete user 2 success:", deleteSuccess);

    // Verify deletion
    const usersAfterDelete = await db.readAll();
    console.log("Users after deleting user 2:", usersAfterDelete);

    // Try deleting a non-existent user
    const deleteFail = db.delete(99);
    console.log("Delete non-existent user:", deleteFail);

    // Clean up the test file
    //fs.unlinkSync(testFilePath);
    console.log("Test file removed.");
}

runTests();
=======
<<<<<<< Updated upstream
import DatabaseManager from './../src/DatabaseManager';
//import FileManager from './../src/FileManager';
=======
import DatabaseManager from '../src/DatabaseManager';
import FileManager from '../src/FileManager';
>>>>>>> Stashed changes

jest.mock('../src/FileManager'); // Mock FileManager

describe('DatabaseManager Unit Tests', () => {
    let dbManager: DatabaseManager<{ _id: number, name: string }>;
    let fileManagerMock: jest.Mocked<FileManager>;

    beforeEach(() => {
        fileManagerMock = new FileManager() as jest.Mocked<FileManager>;
        (FileManager as jest.Mock).mockImplementation(() => fileManagerMock);
        dbManager = new DatabaseManager<{ _id: number, name: string }>('testdb.json');
    });

    test('should initialize database', () => {
        expect(fileManagerMock.readFile).toHaveBeenCalledWith('testdb.json');
    });

    test('should create a new record', async () => {
        fileManagerMock.readFile.mockReturnValue([]);
        fileManagerMock.updateFile.mockImplementation(() => {});

        const item = { _id: 1, name: 'Test Item' };
        await dbManager.create(item);

        expect(fileManagerMock.updateFile).toHaveBeenCalledWith('testdb.json', [item]);
    });

    test('should throw error when creating a duplicate item', async () => {
        fileManagerMock.readFile.mockReturnValue([{ _id: 1, name: 'Test Item' }]);

        await expect(dbManager.create({ _id: 1, name: 'Duplicate' }))
            .rejects.toThrow('Item with ID 1 already exists.');
    });

    test('should return all records', async () => {
        const data = [{ _id: 1, name: 'Test Item' }];
        fileManagerMock.readFile.mockReturnValue(data);

        const records = await dbManager.readAll();
        expect(records).toEqual(data);
    });

    test('should return a record by ID', async () => {
        const data = [{ _id: 1, name: 'Test Item' }];
        fileManagerMock.readFile.mockReturnValue(data);

        const record = await dbManager.readById(1);
        expect(record).toEqual(data[0]);
    });

    test('should return undefined if ID not found', async () => {
        fileManagerMock.readFile.mockReturnValue([]);

        const record = await dbManager.readById(2);
        expect(record).toBeUndefined();
    });

    test('should update a record', async () => {
        const data = [{ _id: 1, name: 'Test Item' }];
        fileManagerMock.readFile.mockReturnValue(data);
        fileManagerMock.updateFile.mockImplementation(() => {});

        const updatedRecord = await dbManager.update(1, { name: 'Updated Item' });

        expect(updatedRecord).toEqual({ _id: 1, name: 'Updated Item' });
        expect(fileManagerMock.updateFile).toHaveBeenCalledWith('testdb.json', [{ _id: 1, name: 'Updated Item' }]);
    });

    test('should return null if updating non-existent record', async () => {
        fileManagerMock.readFile.mockReturnValue([]);

        const result = await dbManager.update(99, { name: 'New Name' });
        expect(result).toBeNull();
    });

    test('should delete a record', () => {
        fileManagerMock.readFile.mockReturnValue([{ _id: 1, name: 'Test Item' }]);
        fileManagerMock.updateFile.mockImplementation(() => {});

        const result = dbManager.delete(1);
        expect(result).toBe(true);
        expect(fileManagerMock.updateFile).toHaveBeenCalledWith('testdb.json', []);
    });

    test('should return false when deleting non-existent record', () => {
        fileManagerMock.readFile.mockReturnValue([]);

        const result = dbManager.delete(99);
        expect(result).toBe(false);
    });
});
>>>>>>> Stashed changes
