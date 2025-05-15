const { test, after , describe , beforeEach} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const listHelper = require('../utils/list_helper')
const testHelper = require('./test-helper.js')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(testHelper.blogs)
})

describe('Blog API testing',() => {
	test('correct quantity of blogs are returned as json', async () => {
	  const response = await api.get('/api/blogs')
	    .expect(200)
	    .expect('Content-Type', /application\/json/)
	  assert.strictEqual(response.body.length, 6)
	})

  test('id property is being used instead of _id', async () => {
    const response = await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.notStrictEqual(response.body[0].id, undefined)
    assert.strictEqual(response.body[0]._id, undefined)
  })

  test('test adding new blog', async () => {
    const newBlog = {
      title: "Callback Hell",
      author: "Max Mapper",
      url: "http://callbackhell.com/",
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const newLength = response.body.length
    assert.strictEqual(newLength, testHelper.blogs.length + 1)
    assert.partialDeepStrictEqual(response.body[ newLength - 1 ], newBlog)
  })

  test('blogs all have valid like count', async () => {
    const currentBlogs = await testHelper.blogsInDb()
    const invalidLikes = currentBlogs.some((currBlog) => currBlog.likes === undefined)
    assert.strictEqual(invalidLikes, false)
  })
  
  describe('Check title and Title and Url are populated', () => {
    test('POST with missing title responds with status 400', async () => {
      const newBlog = {
        author: "Max Mapper",
        url: "http://callbackhell.com/",
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })

    test('POST with missing URL responds with status 400', async () => {
      const newBlog = {
        title: "Callback Hell",
        author: "Max Mapper",
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
  })

  test('blog is deleted when valid ID given', async () => {
    const startingBlogs = await testHelper.blogsInDb()
    const targetBlog = startingBlogs[0]

    await api.delete(`/api/blogs/${targetBlog.id}`).expect(204)
    const resultingBlogs = await testHelper.blogsInDb()
    const resultTitles = resultingBlogs.map(blog => blog.title)
    assert(!resultTitles.includes(targetBlog.title))
    assert.strictEqual(resultingBlogs.length, startingBlogs.length - 1)
  })

  test('blog likes are updated following PUT request', async () => {
    const startingBlogs = await testHelper.blogsInDb()
    const blogToUpdate = startingBlogs[startingBlogs.length - 1]
    const updatedContent = {
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 16,//Changed data
    }

    await api
      .put(`/api/blogs/${blogToUpdate}`)
      .send(updatedContent)

    const resultingBlogs = await testHelper.blogsInDb()
    const resultBlog = resultingBlogs[resultingBlogs.length - 1]
    assert.strictEqual(resultBlog.title, updatedContent.title)
    assert.notStrictEqual(blogToUpdate.likes, updatedContent.likes)
  })
})

after(async () => {
  await mongoose.connection.close()
})