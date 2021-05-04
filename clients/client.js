class Client {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.handles = new Map();
    }

    async insert(document) {
        const handle = await this.getHandle(document.getCollectionName());

        return new Promise((res, rej) => {
            handle.insert(document.toJson(), (err, newDocument) => {
                if (err)
                    rej(err);

                res(document.create(newDocument));
            });
        })
    }

    async findAll(type, query) {
        const handle = await this.getHandle(type.getCollectionName());

        return new Promise((res, rej) => {
            handle.find(query, (err, documents) => {
                if (err)
                    rej(err);

                res(documents);
            });
        });
    }
}

module.exports = { Client };