const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  let blog = new Blog(request.body);

  if (!blog.likes) {
    blog = new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: 0,
    });
  } else if (!blog.url || !blog.title) {
    response.status(400).end();
    return;
  }

  const blogSaved = await blog.save();
  response.status(201).json(blogSaved);
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);

  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const blog = {
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.json(updatedBlog.toJSON());
});

module.exports = blogsRouter;
