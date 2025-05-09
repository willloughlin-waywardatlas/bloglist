const app = require('./app.js')
const config = require('./utils/config.js')
const logger = require('./utils/logger.js')
// const express = require('express')
// const Blog = require('./models/blog')
// const blogsRouter = require('./controllers/blogs')

// const mongoose = require('mongoose')//remove

// const app = express()

// mongoose.connect(config.MONGODB_URI)
// app.use(express.json())
// app.use('/api/blogs', blogsRouter)


app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})