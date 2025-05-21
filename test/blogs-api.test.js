const { test, after , describe , beforeEach} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const listHelper = require('../utils/list_helper')
const testHelper = require('./test-helper.js')
const app = require('../app')
const api = supertest(app)

const loginCorrectUser = async () => {
  const loginResponse = await api
    .post('/api/login')
    .send(testHelper.users[0])
  return loginResponse.body
}

const loginWrongUser = async () => {
  const loginResponse = await api
    .post('/api/login')
    .send(testHelper.users[1])
  return loginResponse.body
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(testHelper.blogs)
  await User.deleteMany({})
  await api.post('/api/users/').send(testHelper.users[0])
  await api.post('/api/users/').send(testHelper.users[1])
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
    const authentication = await loginCorrectUser()

    const newBlog = {
      title: "Callback Hell",
      author: "Max Mapper",
      url: "http://callbackhell.com/",
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authentication.token}`)
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
      const authentication = await loginCorrectUser()
      const newBlog = {
        author: "Max Mapper",
        url: "http://callbackhell.com/",
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authentication.token}`)
        .send(newBlog)
        .expect(400)
    })

    test('POST with missing URL responds with status 400', async () => {
      const authentication = await loginCorrectUser()
      const newBlog = {
        title: "Callback Hell",
        author: "Max Mapper",
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authentication.token}`)
        .send(newBlog)
        .expect(400)
    })
  })

  test('blog is deleted when valid ID given', async () => {
    const authentication = await loginCorrectUser()

    const newBlog = {
      title: "Callback Hell",
      author: "Max Mapper",
      url: "http://callbackhell.com/",
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authentication.token}`)
      .send(newBlog)

    const startingBlogs = await testHelper.blogsInDb()
    const targetBlog = startingBlogs[startingBlogs.length - 1]

    await api
      .delete(`/api/blogs/${targetBlog.id}`)
      .set('Authorization', `Bearer ${authentication.token}`)
      .expect(204)
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
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedContent)
    const resultingBlogs = await testHelper.blogsInDb()
    const resultBlog = resultingBlogs[resultingBlogs.length - 1]
    assert.strictEqual(resultBlog.title, updatedContent.title)
    assert.notStrictEqual(blogToUpdate.likes, updatedContent.likes)
  })

  describe('token authentication testing', () => {
    test('post new blog fails if invalid token', async () => {
      const newBlog = {
        title: "Callback Hell",
        author: "Max Mapper",
        url: "http://callbackhell.com/",
      }

      const postResponse = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
      assert(postResponse.body.error.includes('token error: no token found'))
    })

    test('delete blog fails if incorrect user token', async () => {
      const authentication = await loginCorrectUser()

      const newBlog = {
        title: "Callback Hell",
        author: "Max Mapper",
        url: "http://callbackhell.com/",
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authentication.token}`)
        .send(newBlog)

      const wrongUser = await loginWrongUser()
      const startingBlogs = await testHelper.blogsInDb()
      const targetBlog = startingBlogs[startingBlogs.length - 1]

      const deleteResponse = await api
        .delete(`/api/blogs/${targetBlog.id}`)
        .set('Authorization', `Bearer ${wrongUser.token}`)
        .expect(401)
      const resultingBlogs = await testHelper.blogsInDb()
      assert(deleteResponse.body.error.includes('incorrect user token'))
      assert.strictEqual(resultingBlogs.length, startingBlogs.length)
    })

    test('delete blog fails if no user token', async () => {
      const authentication = await loginCorrectUser()

      const newBlog = {
        title: "Callback Hell",
        author: "Max Mapper",
        url: "http://callbackhell.com/",
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authentication.token}`)
        .send(newBlog)

      const startingBlogs = await testHelper.blogsInDb()
      const targetBlog = startingBlogs[startingBlogs.length - 1]

      const deleteResponse = await api
        .delete(`/api/blogs/${targetBlog.id}`)
        .expect(401)
      const resultingBlogs = await testHelper.blogsInDb()
      assert(deleteResponse.body.error.includes('token error: no token found'))
      assert.strictEqual(resultingBlogs.length, startingBlogs.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})