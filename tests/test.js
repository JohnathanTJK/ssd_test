// import { expect } from 'chai';
// import request from 'supertest';
// import { server } from '../server.js';

// describe('POST /check', () => {
//   it('should respond with submitted input when valid', async () => {
//     const res = await request(server)
//       .post('/check')
//       .type('form')
//       .send({ userInput: 'hi' });

//     expect(res.status).to.equal(200);
//     expect(res.text).to.equal('You submitted: hi');
//   });

//   it('should reject invalid input', async () => {
//     const res = await request(server)
//       .post('/check')
//       .type('form')
//       .send({ userInput: 'bye' });

//     expect(res.status).to.equal(400);
//     expect(res.text).to.equal('Invalid input');
//   });

//   after(() => {
//     server.close();
//   });
// });
import { expect } from 'chai';
import request from 'supertest';
import { server } from '../server.js';

describe('POST /check', () => {
  it('should redirect to /result when input is valid', async () => {
    const res = await request(server)
      .post('/check')
      .type('form')
      .send({ userInput: 'hello world' });

    expect(res.status).to.equal(302); // Expect redirect
    expect(res.headers.location).to.match(/^\/result\?search=/); // Confirm redirection URL
  });

  it('should return same form with empty input on malicious XSS', async () => {
    const res = await request(server)
      .post('/check')
      .type('form')
      .send({ userInput: '<script>alert(1)</script>' });

    expect(res.status).to.equal(200);
    expect(res.text).to.include('<form action="/check" method="POST">');
    expect(res.text).to.include('value=""'); // Field is cleared
  });

  it('should return same form with empty input on SQL injection', async () => {
    const res = await request(server)
      .post('/check')
      .type('form')
      .send({ userInput: "' OR 1=1; --" });

    expect(res.status).to.equal(200);
    expect(res.text).to.include('<form action="/check" method="POST">');
    expect(res.text).to.include('value=""');
  });

  it('should show sanitized input on /result page', async () => {
    const sanitized = '&lt;b&gt;bold&lt;/b&gt;';
    const res = await request(server)
      .get('/result')
      .query({ search: sanitized });

    expect(res.status).to.equal(200);
    expect(res.text).to.include(`<p>${sanitized}</p>`);
  });

  after(() => {
    server.close();
  });
});
