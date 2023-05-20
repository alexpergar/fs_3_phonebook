const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const requestId = Number(request.params.id)
  const person = persons.find(p => p.id === requestId)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
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

  if (persons.find(p => p.name === body.name)) {
    return response.status(409).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    id   : Math.floor(Math.random() * 1000000),
    name : body.name,
    number : body.number
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)

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


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})