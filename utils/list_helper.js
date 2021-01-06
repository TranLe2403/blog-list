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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
