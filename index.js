require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

// MIDDLEWARE
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('postjson', function (req, res) {
  return JSON.stringify(req.body)
})

// Use this middleware if is a POST request
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postjson', {
  skip: function (req, res) { return req.method !== 'POST'}
}))

// Otherwise, use the tiny version
app.use(morgan('tiny', {
  skip: function (req, res) { return req.method === 'POST'}
}))


// REQUESTS
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => response.json(person))
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }

  Person.findOne({ name: body.name })
    .then(person => {
      const newPerson = {
        name : body.name,
        number : body.number
      }
      if (!person) {
        Person(newPerson).save()
          .then(result => {
            response.json(newPerson)
        })
      } else {
        Person.findByIdAndUpdate(person.id, newPerson)
          .then(person => response.json(person))
      }
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const message = 
  `<p>Phonebook has info for ${persons.length} people.</p>
   <p>${new Date().toString()}</p>`
  response.send(message)
})

app.use((request, response) => {
  console.log("error")
  response.status(404).send({ error: 'unknown endpoint' })
})

app.use((error, request, response, next) => {
  console.error(error.message)
  console.error(error.name)
  if (error.name = 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  }
  next(error)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})