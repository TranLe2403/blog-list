const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  let blog = new Blog(request.body);

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);

  if (!blog.likes) {
    blog = new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: 0,
      user: user._id,
    });
  } else if (!blog.url || !blog.title) {
    response.status(400).end();
    return;
  }

  const blogSaved = await blog.save();
  const populatedBlogSaved = await Blog.findById(blogSaved._id).populate(
    "user",
    {
      username: 1,
      name: 1,
    }
  );
  user.blogs = user.blogs.concat(blogSaved._id);
  await user.save();

  response.status(201).json(populatedBlogSaved);
});

blogsRouter.delete("/:id", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const blogInfo = await Blog.findById(request.params.id);
  const authorizedUser = await User.findById(decodedToken.id);
  if (authorizedUser.id.toString() === blogInfo.user.toString()) {
    await Blog.findByIdAndRemove(blogInfo.id);

    response.status(204).end();
    return;
  }

  response.status(400).json("Need to be deleted by creator");
});

blogsRouter.put("/:id", async (request, response) => {
  let body = new Blog(request.body);

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const blog = {
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  }).populate("user", { username: 1, name: 1 });
  response.json(updatedBlog.toJSON());
});

module.exports = blogsRouter;
