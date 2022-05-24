const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://mongo_admin:${password}@cluster0.e7avs.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name,
  number,
});

if (!name && !number) {
  Person.find({}).then((result) => {
    console.log('phonebook:');
    result.forEach((phonebook) => {
      console.log(`${phonebook.name} ${phonebook.number}`);
    });
    mongoose.connection.close();
  });
} else {
  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook!`);
    mongoose.connection.close();
  });
}
