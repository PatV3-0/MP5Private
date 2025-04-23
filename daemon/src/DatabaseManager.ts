import FileManager from './FileManager';

class DatabaseManager<T extends { _id: number }> {
    private fileManager: FileManager;
    private filePath: string;

    constructor(filePath: string) {
        this.fileManager = new FileManager();
        this.filePath = filePath;
        this.initializeDatabase();
    }

    private initializeDatabase(): void {
        try {
            this.fileManager.readFile(this.filePath);
        } catch (error) {
            console.log(error);
            this.fileManager.createFile(this.filePath, []);
        }
    }

    async create(item: T): Promise<T> {
        const records: T[] = this.fileManager.readFile(this.filePath);

        if (records.some(record => record._id === item._id)) {
            throw new Error(`Item with ID ${item._id} already exists.`);
        }

        records.push(item);
        this.fileManager.updateFile(this.filePath, records);
        return item;
    }

    async readAll(): Promise<T[]> {
        console.log(`Reading: ${this.filePath}`);
        return this.fileManager.readFile(this.filePath);
    }

    async readById(id: number): Promise<T | undefined> {
        const records: T[] = this.fileManager.readFile(this.filePath);
        return records.find(record => record._id === id);
    }

    async update(id: number, updatedFields: Partial<T>): Promise<T | null> {
        const records: T[] = this.fileManager.readFile(this.filePath);
        const index = records.findIndex(record => record._id === id);

        if (index === -1) {
            return null;
        }

        records[index] = { ...records[index], ...updatedFields };
        this.fileManager.updateFile(this.filePath, records);
        return records[index];
    }

    delete(id: number): boolean {
        const records: T[] = this.fileManager.readFile(this.filePath);
        const filteredRecords = records.filter(record => record._id !== id);

        if (filteredRecords.length === records.length) {
            return false; // No record found to delete
        }

        this.fileManager.updateFile(this.filePath, filteredRecords);
        return true;
    }
}

export default DatabaseManager;