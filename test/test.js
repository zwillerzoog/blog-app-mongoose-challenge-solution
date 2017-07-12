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


