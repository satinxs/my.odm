class MongoClient {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }
}

module.exports = { MongoClient };