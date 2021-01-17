var _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogArray) => {
  const reducer = (sum, number) => {
    return sum + number;
  };

  return blogArray.map((item) => item.likes).reduce(reducer, 0);
};

const favoriteBlog = (blogArray) => {
  const likesArray = blogArray.map((item) => item.likes);
  const mostLikesIndex = likesArray.findIndex(
    (item) => item === Math.max(...likesArray)
  );
  return {
    title: blogArray[mostLikesIndex].title,
    author: blogArray[mostLikesIndex].author,
    likes: blogArray[mostLikesIndex].likes,
  };
};

const mostBlogs = (blogArray) => {
  const uniqAuthor = blogArray.map((item) => item.author);

  const authorArray = _.forEach(uniqAuthor, (value) => {
    _.find(blogArray, (item) => {
      return value.author === item.author;
    });
  });

  const groupedAuthor = _.groupBy(authorArray);

  const authorObjects = _.values(groupedAuthor).map((item) => ({
    author: item[0],
    blogs: item.length,
  }));

  const mostBlogs = _.max(authorObjects.map((item) => item.blogs));

  const finalAuthor = _.find(authorObjects, (item) => {
    return item.blogs === mostBlogs;
  });
  console.log(finalAuthor);
};

const mostLikes = (blogArray) => {
  const allAuthors = _.uniq(blogArray.map((item) => item.author));
  const authorArray = blogArray.map((item) => ({ [item.author]: item.likes }));

  const authorObjects = allAuthors.map((author) => ({
    name: author,
    likes: _.sumBy(authorArray, author),
  }));

  const mostLikes = _.max(authorObjects.map((item) => item.likes));

  const finalAuthor = _.find(authorObjects, (item) => {
    return item.likes === mostLikes;
  });

  console.log(finalAuthor);
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostLikes,
  mostBlogs,
};
