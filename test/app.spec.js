//write a basic first test
const app = require('../src/app');

describe('App', () => {
    it('GET / responds with 200 Containing "Hello, boilerplate!" ', () => {
        return supertest(app)
            .get('/')
            .expect(200, "Hello, boilerplate!")
    })
})