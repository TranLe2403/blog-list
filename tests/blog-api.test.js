const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const blogObject = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObject.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("Number of blog returned as json format", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("Check that unique identifier property of the blog posts is named id", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("a valid blog can be added", async () => {
  await api
    .post("/api/users")
    .send(helper.initialUsers[0])
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const resp = await api
    .post("/api/login")
    .send({
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password,
    })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const token = resp.body.token;

  const newBlog = {
    title: "This is new blog",
    author: "TL",
    url: "ggogle.com",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogsAtEnd.map((r) => r.title);

  expect(titles).toContain("This is new blog");
});

test("blog without like property added", async () => {
  await api
    .post("/api/users")
    .send(helper.initialUsers[0])
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const resp = await api
    .post("/api/login")
    .send({
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password,
    })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const token = resp.body.token;

  const newBlog = {
    title: "another blog post",
    author: "TL",
    url: "ggogle.com",
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  const likes = response.body.map((r) => r.likes);

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
  expect(likes).toContain(0);
});

test("adding blog fail if no token provided", async () => {
  await api
    .post("/api/users")
    .send(helper.initialUsers[0])
    .expect(200)
    .expect("Content-Type", /application\/json/);

  await api
    .post("/api/login")
    .send({
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password,
    })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const newBlog = {
    title: "another blog post",
    author: "TL",
    url: "ggogle.com",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("update number of like in the blog", async () => {
  await api
    .post("/api/users")
    .send(helper.initialUsers[0])
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const resp = await api
    .post("/api/login")
    .send({
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password,
    })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const token = resp.body.token;

  const newBlog = {
    title: "This is new blog",
    author: "TL",
    url: "ggogle.com",
    likes: 8,
  };

  const addBlog = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${token}`)
    .send(newBlog);

  const updateBlog = await api
    .put(`/api/blogs/${addBlog.body.id}`)
    .send({ likes: 6 });

  expect(updateBlog.body.likes).toEqual(6);
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` to be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test("a valid user can be added", async () => {
    const newUser = {
      username: "TranLe2403",
      name: "TL",
      password: "com",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1);

    const username = usersAtEnd.map((r) => r.username);

    expect(username).toContain("TranLe2403");
  });

  test("user containing invalid username cannot be added", async () => {
    const newUser = {
      username: "Tr",
      name: "TL",
      password: "com",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "is shorter than the minimum allowed length (3)"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
  });

  test("user containing invalid password cannot be added", async () => {
    const newUser = {
      username: "tranl",
      name: "TL",
      password: "12",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Invalid password");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
