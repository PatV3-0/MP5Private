import * as fs from 'fs';
import * as path from 'path';

class FileManager {

    createFile(filePath: string, initialData: any = []): void {

        const fullPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
        const directory = path.dirname(fullPath);

        fs.mkdirSync(directory, { recursive: true });

        //write initial data
        fs.writeFileSync(fullPath, JSON.stringify(initialData, null, 2));
    }

    readFile(filePath: string): any {
        console.log(`fp: ${filePath}`)
        const fullPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }

        const rawData = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(rawData);
    }

    updateFile(filePath: string, data: any): void {
        const fullPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }

        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
    }


    deleteFile(filePath: string): void {
        const fullPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
        
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }

    appendToCollection(filePath: string, key: string, value: any, id: any): void {
        const fullPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found : ${fullPath}`);
        }

        const currentData = this.readFile(fullPath);
        
        if (!Array.isArray(currentData)) {
            throw new Error('File content is not an array');
        }

        //find tagert
        const target = currentData.find(obj => obj._id === id);
        if(target) {
            target[key] = value;
        }

        // Print the updated JSON
        console.log(JSON.stringify(currentData, null, 4));
        this.updateFile(fullPath, currentData);
    }

    test(){
        console.log("Test");
    }

    appendToFile(filePath: string, newData: any): void {
        const fullPath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }

        const currentData = this.readFile(fullPath);
        
        if (!Array.isArray(currentData)) {
            throw new Error('File content is not an array');
        }

        currentData.push(newData);
        this.updateFile(fullPath, currentData);
    }

    getDatabases(userId: string): any[] {
        console.log(`Getting databases for user: ${userId}`);
        console.log(`Getting databases for user: ${userId}`);
        const userDir = path.join('databases', 'users', `${userId}`);
        console.log(`User dir: ${userDir}`);
        console.log(`User dir: ${userDir}`);
        const databases: any[] = [];

        if (!fs.existsSync(userDir)) {
            throw new Error(`User directory not found: ${userDir}`);
        }

        const databaseDirs = fs.readdirSync(userDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        console.log(`Trying to fetch DB's for ${userDir}`);
        console.log(`DBs fetched: ${databaseDirs}`);

        for (const dbName of databaseDirs) {
            const dbPath = path.join(userDir, dbName);
            const dbMetadataPath = path.join(dbPath, `${dbName}.json`);
            console.log(`DB META PATH: ${dbMetadataPath}`)
    
    
            if (fs.existsSync(dbMetadataPath)) {
                // Read the database metadata
                const dbMetadata = this.readFile(dbMetadataPath)[0];
                console.log(`DB META: ${dbMetadata}`)
    
                // Read the collections and replace their names with actual data
                const collectionsWithData = dbMetadata.collections.map((collectionName: string) => {
                    const collectionPath = path.join(dbPath, `${collectionName}.json`);
                    if (fs.existsSync(collectionPath)) {
                        return this.readFile(collectionPath);
                    } else {
                        console.log(`Collection file not found: ${collectionPath}`);
                        return null;
                    }
                }).filter((collectionData: any) => collectionData !== null); // Filter out null values
    
                // Replace the collections field with the actual data
                dbMetadata.collections = collectionsWithData;
    
                databases.push(dbMetadata);
            }
        }
        
        console.log(JSON.stringify(databases, null, 2));
        return databases;
    }

    getPublicDatabases(): any[] {
        const usersDirectoryPath = path.join('databases', 'users');
    
        const publicDatabasesList: any[] = [];
    
        if (!fs.existsSync(usersDirectoryPath)) {
            throw new Error(`Users directory not found: ${usersDirectoryPath}`);
        }
    
        // Read the contents of the users directory
        const directoryEntries = fs.readdirSync(usersDirectoryPath, { withFileTypes: true });
    
        // Filter out only directories (ignore files)
        const userDirectoryEntries = directoryEntries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    
        // Iterate through each user directory
        for (const userDirectoryName of userDirectoryEntries) {
            //const userDirectoryFullPath = path.join(usersDirectoryPath, userDirectoryName);
    
            const userId = userDirectoryName;
            const userDatabases = this.getDatabases(userId);
            
            console.log(`DB check for ${userId}`);
            console.log(userDatabases);

            for (const database of userDatabases) {
                if (database.isPublic) {
                    console.log("Found pdb");
                    publicDatabasesList.push(database);
                }
            }
        }

        console.log("PUB DBS");
        const databaseCollections: { [key: string]: any[] } = {};
        for (const database of publicDatabasesList) {
            databaseCollections[database.name] = database.collections;
        }
        console.log("Database Collections:", JSON.stringify(databaseCollections, null, 2));

        return publicDatabasesList;
    }

    deleteDatabase(userId: string, databaseName: string): void {
        const dbDir = path.join('databases', 'users', `${userId}`, databaseName);
        console.log(`DBDIR: ${dbDir}`);

        if (!fs.existsSync(dbDir)) {
            throw new Error(`Database directory not found: ${dbDir}`);
        }

        /*const files = fs.readdirSync(dbDir);
        for (const file of files) {
            fs.unlinkSync(path.join(dbDir, file));
        }*/

        fs.rmdirSync(dbDir, { recursive: true });
    }

    createDatabase(userId: string, databaseName: string): void {
        const dbDir = path.join('databases', 'users', `${userId}`, databaseName);
        //const dbFilePath = path.join(dbDir, `${databaseName}.json`);

        if (fs.existsSync(dbDir)) {
            throw new Error(`Database directory already exists: ${dbDir}`);
        }

        fs.mkdirSync(dbDir, { recursive: true });
        
        // let dbconf =
        //     {
        //         "_id": "string", 
        //         "name": "string", 
        //         "owner": "string", 
        //         "isPublic": "boolean",
        //         "createdAt": "ISO date string", 
        //         "updatedAt": "ISO date string", 
        //         "description": "string", 
        //         "tags": ["string array"],
        //         "collections": ["Array of collection folder names"],
        //         "permissions": { 
        //           "read": ["userID array"], 
        //           "write": ["userID array"]
        //         },
        //         "loaded": "boolean"
        //       }

        // this.createFile(dbFilePath, [collections]);

        // if (collections && Array.isArray(collections)) {
        //     for (const collection of collections) {
        //         const collectionFilePath = path.join(dbDir, `${collection}.json`);
        //         this.createFile(collectionFilePath, []);
        //     }
        // }
    }

}

export default FileManager;
