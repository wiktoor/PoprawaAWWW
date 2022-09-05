const { assert } = require('chai');
const {
  Builder, By, until,
} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getDb } = require('../../database/database');
const { initFunc } = require('../../database/init_db');
const { userSignUpFill, userSignInFill, bookFill } = require('../utils');
require('../../app');

async function clickAndWaitForErr(driver) {
  const butt = await driver.findElement(By.css('button'));
  await butt.click();

  await driver.wait(until.elementLocated(By.css('.error')), 10000);

  return driver.findElements(By.css('.error'));
}

describe('Testing form valiidity', () => {
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

  it('Signup - null name', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: '',
      last_name: 'testuser2',
      email: 'test@testuser2.pl',
      password: 'lololo',
      password_conf: 'lololo',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Signup - null lastname', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: '',
      email: 'test@testuser2.pl',
      password: 'lololo',
      password_conf: 'lololo',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Signup - null email', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: 'testuser2',
      email: '',
      password: 'lololo',
      password_conf: 'lololo',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Signup - invalid email', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: 'testuser2',
      email: 'test@testuser2',
      password: 'lololo',
      password_conf: 'lololo',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Signup - too short password', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: 'testuser',
      email: 'test@testuser2.pl',
      password: 'lolol',
      password_conf: 'lolol',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Signup - password conf does not match', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: 'testuser2',
      email: 'test@testuser2.pl',
      password: 'lololo',
      password_conf: 'lololx',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Signup - ok', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: 'testuser2',
      email: 'test@testuser2.pl',
      password: 'test21234',
      password_conf: 'test21234',
    });

    const butt = await driver.findElement(By.css('button'));
    await butt.click();

    const loginButt = await driver.wait(until.elementLocated(By.css('button')), 10000);
    const type = await loginButt.getText();

    assert.equal('LogIn', type);
  });

  it('Signup - user with this email exists', async () => {
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser',
      last_name: 'testuser',
      email: 'testuser@test.com',
      password: 'test1234',
      password_conf: 'test1234',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Login - invalid email', async () => {
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'test@testuser',
      password: 'test21234',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Login - too short password', async () => {
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'testuser@test.com',
      password: 'test123',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Login invalid credentials', async () => {
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'testuser@test.com',
      password: 'test1235',
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Login - ok', async () => {
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'testuser@test.com',
      password: 'test1234',
    });

    const butt = await driver.findElement(By.css('button'));
    await butt.click();

    const welcome = await driver.wait(until.elementLocated(By.css('.welcome')), 10000);

    assert.exists(welcome);
  });

  it('Booking - blank first name', async () => {
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: '',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 2,
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Booking - blank last name', async () => {
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: 'Radosław',
      last_name: '',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 2,
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Booking - invalid email', async () => {
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp',
      liczba_miejsc: 2,
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Booking - zero ppl', async () => {
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 0,
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Booking - not enough spots', async () => {
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 100,
    });

    const errors = await clickAndWaitForErr(driver);

    assert.equal(1, errors.length);
  });

  it('Booking - valid', async () => {
    await driver.get('http://localhost:3000/trip/1');

    const numberOfSpotsBeforeEl = await driver.findElement(By.css('.miejsc')).getText();
    const valBefore = parseInt(numberOfSpotsBeforeEl.match(/[0-9]+/)[0], 10);
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 2,
    });

    const butt = await driver.findElement(By.css('button'));
    await butt.click();

    const numberOfSpotsAfterEl = await driver.wait(until.elementLocated(By.css('.miejsc')), 10000).getText();
    const valAfter = parseInt(numberOfSpotsAfterEl.match(/[0-9]+/)[0], 10);
    assert.equal(valBefore - 2, valAfter);
  });

  after(async () => {
    await driver.quit();
  });
});