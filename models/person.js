const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log('Error connecting to MongoDB: ', error.message)
    })

function numberValidator(number) {
    const parts = number.split('-')

    if (parts.length != 2) return false

    if (isNaN(parts[0])
      || isNaN(parts[1])
      || (parts[0].length != 2 && parts[0].length != 3)) {
        return false
    }
}

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: numberValidator,
            message: 'The number is not in the correct format.'
        }
    }
})

// Deleting unwanted variables from object
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)
module.exports = Person