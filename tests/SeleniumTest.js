import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';

const environment = process.argv[2] || 'local';

const seleniumUrl = environment === 'github' 
  ? 'http://selenium:4444/wd/hub' 
  : 'http://localhost:4444/wd/hub';

const serverUrl = environment === 'github' 
  ? 'http://testserver:3000' 
  : 'http://host.docker.internal:3000';

console.log(`Running tests in '${environment}' environment`);
console.log(`Selenium URL: ${seleniumUrl}`);
console.log(`Server URL: ${serverUrl}`);

async function testValidInput() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .usingServer(seleniumUrl)
    .build();

  try {
    await driver.get(serverUrl);

    const inputField = await driver.findElement(By.id('userInput'));
    await inputField.sendKeys('hello');

    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    // Wait for navigation to /result and locate the <p> with the result text
    await driver.wait(until.urlContains('/result'), 5000);
    const resultParagraph = await driver.wait(
      until.elementLocated(By.css('p')),
      5000
    );

    const resultText = await resultParagraph.getText();
    console.log('Valid input test result text:', resultText);

    assert.strictEqual(resultText, 'hi', 'Result text should be "hi"');

    console.log('Valid input test passed.');

  } finally {
    await driver.quit();
  }
}

async function testMaliciousInput() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .usingServer(seleniumUrl)
    .build();

  try {
    await driver.get(serverUrl);

    const inputField = await driver.findElement(By.id('userInput'));
    // Example malicious input (SQL injection)
    await inputField.sendKeys("SELECT * FROM users;");

    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    // Wait for the input box to be located again (form re-rendered)
    const newInputField = await driver.wait(
      until.elementLocated(By.id('userInput')),
      5000
    );

    // Get the value attribute of the input field, should be empty string
    const value = await newInputField.getAttribute('value');
    console.log('Malicious input test, input value after submit:', value);

    assert.strictEqual(value, '', 'Input field should be cleared for malicious input');

    console.log('Malicious input test passed.');

  } finally {
    await driver.quit();
  }
}

(async () => {
  try {
    await testValidInput();
    await testMaliciousInput();
  } catch (err) {
    console.error('Test suite failed:', err);
    process.exit(1);
  }
})();
