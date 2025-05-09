const config = require('./utils/config.js')
const express = require('express')
const logger = require('./utils/logger.js')
const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')

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
app.use('/api/blogs', blogsRouter)

module.exports = app