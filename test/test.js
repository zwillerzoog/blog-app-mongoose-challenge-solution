'use strict';

const faker = require('faker');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  const seedData = [];
  for (let i=0; i <= 10; i++) {
    seedData.push(generatePostData());
  }
  return BlogPost.insertMany(seedData);
}

function generateContent() {
  return {content: faker.text()};
}

function generateAuthor() {
  return {author: faker.name()};
}

function generateTitle() {
  return {title: faker.name.title()};
}

function generatePostData() {
  return {
    title: generateTitle(),
    author: generateAuthor(),
    content: generateContent()
  };
}


function tearDownDb() {
  console.warn('About to delete DB');
  return mongoose.connection.dropDatabase();
}

describe('Blog Posts API resource'f, function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should return all existing blog posts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res; // ask about this
          res.should.have.status(200);
          res.body.posts.should.have.length.of.at.least(1);
          return Posts.count();
        })
        .then(function(count) {
          res.body.posts.should.have.length.of(count);
        });
    });

    it('should return blog posts with the correct fields', function() {
      let resPost;
      return chai.request(app)
        .get'(/posts')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.posts.should.be.a('array');
          res.body.posts.should.have.length.of.at.least(1);
          res.body.restaurant.forEach(function(post) {
            post.should.be.a('object');
            post.should.include.keys(
              'title', 'author', 'content', 'id', 'created'
            );
          });
          resPost= res.body.posts[0];
          return Post.findById(resPost.id);
        })
        .then(function(post) {
          resPost.id.should.equal(post.id);
          resPost.title.should.equal(post.title);
          resPost.content.should.equal(post.content);
          resPost.author.should.equal(post.author);
        });
    });
  });
});

describe('POST endpoint', function() {
  // strategy: make a POST request with data,
  // then prove that the restaurant we get back has
  // right keys, and that `id` is there (which means
  // the data was inserted into db)
  it('should add a new blog post', function() {

    const newBlog = generateBlogData();

    return chai.request(app)
      .post('/posts')
      .send(newBlog)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys(
          'title', 'author', 'content', 'id', 'created');
        res.body.title.should.equal(newBlog.title);
        res.body.id.should.not.be.null;
        res.body.content.should.equal(newBlog.content);
        res.body.author.should.equal(newBlog.author);

        return Post.findById(res.body.id);
      })
      .then(function(post) {
        res.body.title.should.equal(newBlog.title);
        res.body.id.should.not.be.null;
        res.body.content.should.equal(newBlog.content);
        res.body.author.should.equal(newBlog.author);
      });
  });
});

describe('PUT endpoint', function() {

  it('should update fields you send over', function() {
    const updateData = {
      title: 'fofofofofofofof',
      author: 'Michael Jackson'
    };

    return Post
      .findOne()
      .exec()
      .then(function(post) {
        updateData.id = post.id;
        return chai.request(app)
          .put(`/posts/${post.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(204);
        return Post.findById(updateData.id).exec();
      })
      .then(function(post) {
        post.name.should.equal(updateData.title);
        post.cuisine.should.equal(updateData.author);
      });
    });
});

describe('DELETE endpoint', function() {

  it('delete a blog post by id', function() {

    let post;

    return Post
      .findOne()
      .exec()
      .then(function(_post) {
        post = _post;
        return chai.request(app).delete(`/posts/${post.id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
        return Post.findById(post.id).exec();
      })
      .then(function(_post) {
        should.not.exist(_post);
      });
  });
});
});
