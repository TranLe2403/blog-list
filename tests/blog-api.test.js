const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const Blog = require("../models/blog");

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

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();

  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test("Number of blog returned as json format", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(initialBlogs.length);
});

test("Check that unique identifier property of the blog posts is named id", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "This is new blog",
    author: "TL",
    url: "ggogle.com",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  const titles = response.body.map((r) => r.title);

  expect(response.body).toHaveLength(initialBlogs.length + 1);
  expect(titles).toContain("This is new blog");
});

test("blog without like property added", async () => {
  const newBlog = {
    title: "another blog post",
    author: "TL",
    url: "ggogle.com",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  const likes = response.body.map((r) => r.likes);

  expect(response.body).toHaveLength(initialBlogs.length + 1);
  expect(likes).toContain(0);
});

test.only("update number of like in the blog", async () => {
  const newBlog = {
    title: "This is new blog",
    author: "TL",
    url: "ggogle.com",
    likes: 8,
  };

  const addBlog = await api.post("/api/blogs").send(newBlog);

  const updateBlog = await api
    .put(`/api/blogs/${addBlog.body.id}`)
    .send({ likes: 6 });

  console.log(updateBlog);
  expect(updateBlog.body.likes).toEqual(6);
});

afterAll(() => {
  mongoose.connection.close();
});
