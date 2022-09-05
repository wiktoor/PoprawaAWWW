const { assert } = require('chai');
const {
  Builder, By, until,
} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getDb } = require('../../database/database');
const { initFunc } = require('../../database/init_db');
const { getUser } = require('../../database/query');
const {
  userSignUpFill, bookFill, userSignInFill,
} = require('../utils');
require('../../app');

async function clickButton(driver) {
  return driver.findElement(By.css('button')).click();
}

describe("Testing user's functionalities", () => {
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
  /* komentarz */

  it('Successfull Signup', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser2',
      last_name: 'testuser2',
      email: 'test@testuser2.pl',
      password: 'lololo',
      password_conf: 'lololo',
    });

    await clickButton(driver);

    const isLoginPage = await driver.wait(until.elementLocated(By.css('form')), 10000);

    const user = await getUser(db, 'test@testuser2.pl');

    assert.exists(isLoginPage);
    assert.exists(user);
  });

  it('Successfull login and good profile page', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'test@testuser2.pl',
      password: 'lololo',
    });

    await clickButton(driver);

    const spisZgloszen = await driver.wait(until.elementLocated(By.css('.spis_zgloszen')), 10000);

    assert.exists(spisZgloszen);
  });

  it('Successfull login and logout', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'test@testuser2.pl',
      password: 'lololo',
    });

    await clickButton(driver);

    const logout = await driver.wait(until.elementLocated(By.css('.logout')), 10000);
    await logout.click();

    const spisWycieczek = await driver.wait(until.elementLocated(By.css('.spis_wycieczek')), 10000);

    assert.exists(spisWycieczek);
  });

  it('Redirect when logged and want to sign up or log', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'test@testuser2.pl',
      password: 'lololo',
    });

    await clickButton(driver);

    const spisZgloszen = await driver.wait(until.elementLocated(By.css('.spis_zgloszen')), 10000);
    await driver.get('http://localhost:3000/login');

    const spisZgloszen2 = await driver.wait(until.elementLocated(By.css('.spis_zgloszen')), 10000);

    assert.exists(spisZgloszen);
    assert.exists(spisZgloszen2);
  });

  it('Good profile page bookings - reserved before user created', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/book/1');

    await bookFill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 2,
    });

    await clickButton(driver);

    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      password: 'qwerty',
      password_conf: 'qwerty',
    });

    await clickButton(driver);

    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'superradzio@wp.pl',
      password: 'qwerty',
    });

    await clickButton(driver);

    await driver.wait(until.elementLocated(By.css('.spis_zgloszen')), 10000);
    const zgloszenia = await driver.findElements(By.css('.zgloszenie'));

    assert.equal(1, zgloszenia.length);
  });

  it('Book after login - filled', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'testuser@test.com',
      password: 'test1234',
    });

    await clickButton(driver);

    await driver.get('http://localhost:3000/book/1');

    const lMiejsc = await driver.findElement(By.name('liczba_miejsc'));
    await lMiejsc.clear();
    await lMiejsc.sendKeys('1');

    await clickButton(driver);

    const succMsg = await driver.wait(until.elementLocated(By.css('.succ')), 10000);

    assert.exists(succMsg);
  });

  it('Good profile page bookings - reserved afetr user created, but no login', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/signup');

    await userSignUpFill(driver, {
      first_name: 'testuser3',
      last_name: 'testuser3',
      email: 'test@testuser3.pl',
      password: 'lololo',
      password_conf: 'lololo',
    });

    await clickButton(driver);

    await driver.wait(until.elementLocated(By.css('form')), 10000);

    const user = await getUser(db, 'test@testuser3.pl');

    await driver.get('http://localhost:3000/book/2');

    await bookFill(driver, {
      first_name: 'testuser3',
      last_name: 'testuser3',
      email: 'test@testuser3.pl',
      liczba_miejsc: 2,
    });

    await clickButton(driver);

    await driver.get('http://localhost:3000/login');

    await userSignInFill(driver, {
      email: 'test@testuser3.pl',
      password: 'lololo',
    });

    await clickButton(driver);

    const zgloszenia = await driver.findElements(By.css('.zgloszenie'));

    assert.equal(1, zgloszenia.length);
    assert.exists(user);
  });

  after(async () => driver.quit());
});