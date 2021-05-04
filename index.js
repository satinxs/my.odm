function getPublicProperties(obj) {
    const properties = Object.getOwnPropertyDescriptors(obj);

    const propertyKeys = Object.keys(properties);

    const publicKeys = propertyKeys.filter(pk => !pk.startsWith("_"));

    return publicKeys.map(pk => ({ key: pk, prop: properties[pk] }));
}

class Document {
    static create(initialData) {
        const el = new this.prototype.constructor();

        el._properties = getPublicProperties(el);
        el._collectionName = this.getCollectionName();
        el._id = initialData.id;

        for (const { key, prop } of el._properties)
            el[key] = initialData[key] ?? prop.value.default();

        const prototype = Object.getPrototypeOf(el);
        const superProtototype = Object.getPrototypeOf(this);

        prototype.create = superProtototype.create;

        Object.setPrototypeOf(el, prototype);

        return el;
    }

    get id() {
        return this._id;
    }

    getCollectionName() {
        return this._collectionName;
    }

    toJson() {
        const value = { _id: this.id };

        for (const { key, prop } of this._properties)
            value[key] = this[key] || prop.value.default();

        return value;
    }
}

class Field {
    constructor(type) {
        this.type = type;
    }

    default() {
        return ({
            [String]: '',
            [Number]: 0,
            [Array]: [],
            [Object]: {},
            [Boolean]: false,
        })[this.type];
    }
}

async function getClient(connectionString) {
    if (connectionString.startsWith("nedb://")) {
        const { NedbClient } = require('./clients/nedb');
        return new NedbClient(connectionString);
    } else if (connectionString.startsWith("mongo://")) {
        const { MongoClient } = require('./clients/mongo');
        return new MongoClient(connectionString);
    } else
        throw new Error(`Unknown connection string format: "${connectionString}"`);
}

async function connect(connectionString) {
    const client = await getClient(connectionString);

    await client.connect();

    return client;
}

module.exports = {
    Document,
    connect,
    Field
};