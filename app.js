const config = require('./utils/config.js')
require('express-async-errors')
const express = require('express')
const logger = require('./utils/logger.js')
const middleware = require('./utils/middleware')
const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const mongoose = require('mongoose')

logger.info('connecting to ', config.MONGODB_URI)

const app = express()

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.info('error connecting to MongoDB', error.message)
  })

app.use(express.json())
if(process.env.NODE_ENV !== 'test'){
  app.use(middleware.requestLogger)
}
app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app