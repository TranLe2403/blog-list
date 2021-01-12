const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "This is a blog",
    author: "Tran Le",
    url: "abc.com",
    likes: 3,
  },
  {
    title: "This is another blog",
    author: "Tran Le",
    url: "xyz.com",
    likes: 5,
  },
];

const initialUsers = [
  {
    username: "tran",
    name: "tranle",
    password: "tran234",
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const notes = await Blog.find({});
  return notes.map((note) => note.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
