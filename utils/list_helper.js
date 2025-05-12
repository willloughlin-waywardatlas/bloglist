const _ = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return item.likes > 0 ? sum + item.likes : sum
  }
  return blogs.reduce(reducer,0)
}

const favoriteBlog = (blogs) => {
  const reducer = (leader, item) => {
    return item.likes > leader.likes ? item : leader
  }
  const initialValue = { likes: 0 }
  const result = blogs.reduce(reducer,initialValue)
  return result === initialValue ? null : result
}

const mostBlogs = (blogs) => {
  const blogCounts = _.countBy(blogs, 'author')
  // const reducer = (leader, [author, count]) => {
  //   return count > blogCounts[leader] ? author : leader;
  // }
  const result = Object.entries(blogCounts).reduce((leader, [author, count]) => {
    return count > blogCounts[leader] ? author : leader;
  },Object.keys(blogCounts)[0])
  return {author:result, blogs:blogCounts[result]}
}

const mostLikes = (blogs) => {
  const authorLikes = blogs.reduce((value, blog) => {
    const blogLikes = blog.likes === undefined ? 0 : blog.likes
    value[blog.author] = value[blog.author] > 0 ? value[blog.author] += blogLikes : blogLikes
    return value
  },{})

  const topAuthor = Object.entries(authorLikes).reduce((leader, [author, count]) => {
    return count > authorLikes[leader] ? author : leader;
  },Object.keys(authorLikes)[0])

  return {author:topAuthor, likes:authorLikes[topAuthor]}
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
