const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const testHelper = require('./test-helper.js')

describe('Total likes',() => {  
  test('of empty list returning 0', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has one blog return the likes for that blog', () => {
    const result = listHelper.totalLikes(testHelper.singleBlog)
    assert.strictEqual(result, 7)
  })

  test('Populated list calculates correctly', () => {
    const result = listHelper.totalLikes(testHelper.blogs)
    assert.strictEqual(result, 36)
  })
})

describe('Favorite blog',() => {  
  test('of empty list returning null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })

  test('when list has one blog return it', () => {
    const result = listHelper.favoriteBlog(testHelper.singleBlog)
    assert.deepStrictEqual(result,
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
    })
  })

  test('that favorite blog is Canonical string reduction', () => {
    const result = listHelper.favoriteBlog(testHelper.blogs)
    assert.deepStrictEqual(result, 
    {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
    })
  })
})

describe('Most blogs', () => {
  test('that the most blogs have been written by Robert C. Martin with 3 entries', () => {
    const result = listHelper.mostBlogs(testHelper.blogs)
    assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
  })

  test('that the only blog given is returned in an array length of 1', () => {
    const result = listHelper.mostBlogs(testHelper.singleBlog)
    assert.deepStrictEqual(result, { author: 'Michael Chan', blogs: 1 })
  })
})

describe('Most likes', () => {
  test('that the most popular blog author is Edsger W. Dijkstra with 17 likes', () => {
    const result = listHelper.mostLikes(testHelper.blogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 })
  })

  test('that the only blog given is returned in an array length of 1', () => {
    const result = listHelper.mostLikes(testHelper.singleBlog)
    assert.deepStrictEqual(result, { author: 'Michael Chan', likes: 7 })
  })
})
