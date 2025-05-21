const { test, after , describe , beforeEach} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const User = require('../models/user')
const testHelper = require('./test-helper.js')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  for (const newUser of testHelper.users) {
    await api.post('/api/users/').send(newUser)
  }
})

describe('user API testing', () => {
  describe('test for missing data', () => {
    test('username cannot be blank', async () => {
      const newUser = {
        name: "Aaron Alias",
        password: "@verylovelylongpa$$word"
      }

      const response = await api
        .post('/api/users/')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      assert(response.body.error.includes('`username` is required.'))
    })

    test('password cannot be blank', async () => {
      const newUser = {
        username: "Aalias",
        name: "Aaron Alias"
      }

      const response = await api
        .post('/api/users/')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      
      assert(response.body.error.includes('Password cannot be blank'))
    })
  })
  
  test('username must be unique', async () => {
      const newUser = {
        username: "pineconethegreenmile",
        name: "John Smith",
        password: "G7$4ZjIBFJi7T6x&hp4D"
      }

      const response = await api
        .post('/api/users/')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      
      assert(response.body.error.includes('expected `username` to be unique'))
  })

  describe('username and password must both be atleast 3 characters', () => {
    test('username must be at least 3 characters', async () => {
      const newUser = {
        username: "Aa",
        name: "Aaron Alias",
        password: "@verylovelylongpa$$word"
      }

      const response = await api
        .post('/api/users/')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      
      assert(response.body.error.includes('is shorter than the minimum allowed length'))
    })

    test('password must be at least 3 characters', async () => {
      const newUser = {
        username: "Aalias",
        name: "Aaron Alias",
        password: "@v"
      }

      const response = await api
        .post('/api/users/')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      
      assert(response.body.error.includes('Password must be more than 2 characters'))
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})