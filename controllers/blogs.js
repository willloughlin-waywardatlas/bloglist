const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const usersRouter = require('./users')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id: 1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const user = request.user
  if(user === null){
    return response.status(401).json({ error: `token error: ${request.tokenStatus}` })
  }

  if( blog.title === undefined || blog.url === undefined ) {
    response.status(400).end()
  } else {
    blog.user = user
    const resultBlog = await blog.save()
    user.blogs = user.blogs.concat(blog.id)
    await user.save()
    response.status(201).json(resultBlog)
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: `token error: ${request.tokenStatus}` })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }
  if ( blog.user.toString() === request.user.id.toString() ) {
    await Blog.deleteOne(blog)
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'incorrect user token' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes , user} = request.body

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  blog.title = title
  blog.author = author
  blog.url = url
  blog.likes = likes
  blog.user = user

  const updatedBlog =  await blog.save()
  return response.json(updatedBlog)
})

module.exports = blogsRouter