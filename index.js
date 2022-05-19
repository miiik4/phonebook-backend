const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

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

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  const page = `Phonebook has info for ${persons.length} people <br/><br/> ${new Date()}`;
  response.send(page);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  person ? response.json(person) : response.status(404).end();
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((note) => note.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name and number are required' });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({ error: 'name must be unique' });
  }

  const newPerson = { id: Math.floor(100000 + Math.random() * 900000), ...body };
  persons = persons.concat(newPerson);
  response.json(persons);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
