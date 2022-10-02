const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017`, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
})
.then(() => {
    console.log(`MongoDB connected.`)
})
.catch(err => console.log(err.message))

mongoose.connection.on(`connected`, ()=> {
    console.log(`Mongoose connected to DB:`,process.env.DB_NAME)
})

mongoose.connection.on(`error`, (err) => {
    console.log(err.message)
})


mongoose.connection.on('disconnected', () => {
    console.log(`Mongoose disconnected`)
})

process.on(`SIGINT`, async () => {
    await mongoose.connection.close()
    console.log("Mongoose Disconnected")
    process.exit(0)
})