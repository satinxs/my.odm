(async () => {
    try {
        const { connect, Document, Field } = require('../index');

        class Person extends Document {

            name = new Field(String);
            lastName = new Field(String);

            static getCollectionName = () => "people";
        }

        const client = await connect('nedb://memory');

        const santi = Person.create({ name: 'Santi' });

        await client.insert(santi);

        let result = await client.findAll(Person, {});

        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();