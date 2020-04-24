//set up two global variables so that supertest and expect do not need to be required in each test case
const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;