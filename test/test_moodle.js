const { equal } = require('assert');
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { takeScreenshot } = require('./utils');
const { fun, asyncfun } = require('./example');

describe('Function', () => {
  it("should output string equal to 'test'", () => {
    equal(fun(), 'test');
  });
});

describe('Async function', () => {
  it("should output string equal to 'atest'", async () => {
    const a = await asyncfun();
    console.log(a);
    equal(a, 'atest');
  });
});

describe('Selenium test', () => {
  const TIMEOUT = 10000;
  let driver;

  before(async () => {
    const options = new firefox.Options();
    options.headless();
    driver = await new Builder()
      .setFirefoxOptions(options)
      .forBrowser('firefox')
      .build();

    await driver
      .manage()
      .setTimeouts({ implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT });
  });

  it('should go to google.com and check title', async () => {
    await driver.get('https://www.google.com');
    await takeScreenshot(driver, 'test.png');
    const title = await driver.getTitle();
    equal(title, 'Google');
  });

  after(async () => driver.quit());
});