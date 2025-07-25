// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const app = express();

// // Add this middleware BEFORE your routes
// app.use(express.urlencoded({ extended: true }));

// // Get __dirname equivalent (needed in ES modules)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve static files from 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Example for Express
// app.get('/', (req, res) => {
//   res.send('Server is up!');
// });

// // API endpoint
// app.post('/check', (req, res) => {
//   const input = req.body.userInput;

//   if (!endpointValidateInput(input)) {
//     // If validation fails, send 400 Bad Request with an error message
//     return res.status(400).send('Invalid input');
//   }

//   // If validation passes, send success response
//   res.send(`You submitted: ${input}`);
// });

// // Helper function to get the current timestamp
// export function getCurrentTimestamp() {
//   return new Date().toISOString();
// }
// export function endpointValidateInput(text) {
//   return text === "hi";
// }

// server.js
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic input sanitizer
function isMalicious(input) {
  const xssPattern = /<script.*?>.*?<\/script.*?>/gi;

  const sqlPattern = /(\b(select|union|insert|delete|drop|update)\b.*)|(['"]\s*or\s+[\d\w]+[\s=><]+[\d\w]+)|(--|#|\/\*)/gi;

  return xssPattern.test(input) || sqlPattern.test(input);
}


// POST /check
app.post('/check', (req, res) => {
  let userInput = req.body.userInput || '';

  if (isMalicious(userInput)) {
    userInput = ""; // Clear input

    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Browser Info</title>
      </head>
      <body>
        <h2>Search Term</h2>
        <form action="/check" method="POST">
          <label for="userInput">Enter something:</label>
          <input type="text" id="userInput" name="userInput" required value="">
          <button type="submit">Submit</button>
        </form>
      </body>
      </html>
    `);
  }

  // Escape HTML
  const sanitizedInput = userInput
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Redirect to result page
  res.redirect(`/result?search=${encodeURIComponent(sanitizedInput)}`);
});


// GET /result
app.get('/result', (req, res) => {
  const search = req.query.search || '';
  res.send(`
    <h2>Search Term</h2>
    <p>${search}</p>
    <form action="/" method="GET">
        <button type="submit">Search Again</button>
    </form>

  `);
});


// Start the server
const PORT = 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export { server };