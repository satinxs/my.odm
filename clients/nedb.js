const fs = require('fs/promises');
const path = require('path');
const DataStore = require('nedb');
const { Client } = require('./client');

class NedbClient extends Client {
    constructor(connectionString) {
        super(connectionString);

        this.inMemoryOnly = false;
        this.persistenceDirectory = null;
    }

    async connect() {
        const connectionPart = this.connectionString.replace('nedb://', '');

        if (connectionPart == 'memory')
            this.inMemoryOnly = true;
        else {
            const stat = await fs.stat(connectionPart);

            if (!stat.isDirectory())
                throw new Error(`The connection string "${this.connectionString}" must be a valid directory.`);

            this.persistenceDirectory = path.join(__dirname, connectionPart);
        }
    }

    async getHandle(collectionName) {
        //If collectionName was already registered, we can just get the cached handle.
        if (this.handles.has(collectionName))
            return this.handles.get(collectionName);

        //If it's in memory, create a new memory handle.
        if (this.inMemoryOnly) {
            const handle = new DataStore({ inMemoryOnly: true });

            this.handles.set(collectionName, handle);

            return handle;
        } else {
            //Else create a new file handle and return.
            const handle = new DataStore({ filename: path.join(this.persistenceDirectory, `${collectionName}.db`) });

            this.handles.set(collectionName, handle);

            return handle;
        }
    }
}

module.exports = { NedbClient };