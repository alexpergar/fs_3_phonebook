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

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => response.json(person))
    .catch(error => response.status(404).end())
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

  // if (persons.find(p => p.name === body.name)) {
  //   return response.status(409).json({
  //     error: 'name must be unique'
  //   })
  // }

  const newPerson = Person({
    id   : Math.floor(Math.random() * 1000000),
    name : body.name,
    number : body.number
  })
    
  newPerson.save().then(result => {
    console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
    response.json(newPerson)
  })

})

app.delete('/api/persons/:id', (request, response) => {
  const requestId = Number(request.params.id)
  persons = persons.filter(p => p.id !== requestId)

  response.status(204).end()

})

app.get('/info', (request, response) => {
  const message = 
  `<p>Phonebook has info for ${persons.length} people.</p>
   <p>${new Date().toString()}</p>`
  response.send(message)
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})