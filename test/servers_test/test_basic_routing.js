/* eslint-disable no-undef */
const { assert } = require('chai');
const {
  Builder, By,
} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getDb } = require('../../database/database');
const { initFunc } = require('../../database/init_db');

require('../../app');

describe('Basic routing tests', () => {
  const TIMEOUT = 10000;
  let driver;
  let db;

  before(async () => {
    db = await getDb();
    await initFunc(db);
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

  it('Main site', async () => {
    await driver.get('http://localhost:3000/main');

    const shouldExist = await driver.findElement(By.css('.trip_list'));
    assert.exists(shouldExist, 'is not null');
  });

  it('Trip book success site for event with pk 1', async () => {
    await driver.get('http://localhost:3000/trip/succ/1');

    const succMsg = await driver.findElement(By.css('.succ')).getText();
    const programWyc = await driver.findElement(By.css('.prog')).getText();

    assert.isNotNull(succMsg);
    assert.exists(programWyc);
  });

  it('Trip detail site for event with pk 1', async () => {
    await driver.get('http://localhost:3000/trip/1');

    const header = await driver.findElement(By.css('h1')).getText();
    const succMsg = await driver.findElement(By.css('.succ')).getText();
    const programWyc = await driver.findElement(By.css('.prog')).getText();

    assert.match(header, /\w+ wycieczka ID: 1$/);
    assert.equal(succMsg, '');
    assert.exists(programWyc);
  });

  it('Form for trip with pk 1', async () => {
    await driver.get('http://localhost:3000/book/1');

    const paragraph = await driver.findElement(By.css('p')).getText();
    const form = await driver.findElement(By.css('form')).getText();

    assert.exists(form);
    assert.match(paragraph, /^Wycieczka 1$/);
  });

  it('Signup page', async () => {
    await driver.get('http://localhost:3000/signup');

    const paragraph = await driver.findElement(By.css('p')).getText();
    const form = await driver.findElement(By.css('form')).getText();

    assert.exists(form);
    assert.match(paragraph, /^Zarejestruj się!$/);
  });

  it('Login page', async () => {
    await driver.get('http://localhost:3000/login');
    const paragraph = await driver.findElement(By.css('p')).getText();
    const form = await driver.findElement(By.css('form')).getText();

    assert.exists(form);
    assert.match(paragraph, /^Zaloguj się!$/);
  });

  after(async () => {
    await driver.quit();
  });
});