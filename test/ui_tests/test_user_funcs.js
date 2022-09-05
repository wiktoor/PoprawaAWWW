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

    const spisWycieczek = await driver.wait(until.elementLocated(By.css('.trip_list')), 10000);

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

  after(async () => driver.quit());
});