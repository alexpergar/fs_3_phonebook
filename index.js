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

morgan.token('postjson', function (req) {
    return JSON.stringify(req.body)
})

// Use this middleware if is a POST request
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postjson', {
    skip: function (req) { return req.method !== 'POST'}
}))

// Otherwise, use the tiny version
app.use(morgan('tiny', {
    skip: function (req) { return req.method === 'POST'}
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

app.post('/api/persons/', (request, response, next) => {
    const body = request.body

    new Person({
        name: body.name,
        number: body.number,
    })
        .save()
        .then(result => {
            response.json(result)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id, 
        { name, number },
        { new: true, runValidators: true, context:'query' })
        .then(person => {
            response.json(person)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        const message = 
      `<p>Phonebook has info for ${persons.length} people.</p>
      <p>${new Date().toString()}</p>`
        response.send(message)
    })

})

app.use((request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
})

app.use((error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})