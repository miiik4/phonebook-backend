require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

const app = express();

// configure morgan
morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

// use middleware
app.use(express.json());
app.use(express.static('build'));
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'));
app.use(cors());

// fetch all persons
app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((result) => {
      const page = `Phonebook has info for ${result.length} people <br/><br/> ${new Date()}`;
      response.send(page);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findById(mongoose.Types.ObjectId(id))
    .then((person) => {
      person ? response.json(person) : response.status(404).end();
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(mongoose.Types.ObjectId(id))
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// update existing person
app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  const person = request.body;

  Person.findByIdAndUpdate(mongoose.Types.ObjectId(id), person, { new: true, runValidators: true, context: 'query' })
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

// create a new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name and number are required' });
  }

  Person.find({ name: body.name })
    .then((persons) => {
      if (persons.length > 0) {
        return response.status(400).json({ error: 'name must be unique' });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person
        .save({ runValidators: true, context: 'query' })
        .then((result) => {
          response.json(result);
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
