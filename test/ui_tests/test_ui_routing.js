const { assert } = require('chai');
const {
  Builder, By, until,
} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getDb } = require('../../database/database');
const { initFunc } = require('../../database/init_db');
const { userSignInFill, getNavbar } = require('../utils');
require('../../app');

describe('Testing buttons and ui', () => {
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

  it('Book from main', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/main');

    const trip = await driver.findElement(By.css('.wycieczka'));
    const book = await trip.findElement(By.css('a'));
    await book.click();

    const form = await driver.wait(until.elementLocated(By.css('form')), 10000);

    assert.exists(form);
  });

  it('Login from main', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/main');

    const navbar = await getNavbar(driver);
    await navbar.findElement(By.css('.login')).click();

    const form = await driver.wait(until.elementLocated(By.css('form')), 10000);

    assert.exists(form);
  });

  it('Signup from main', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/main');

    const navbar = await getNavbar(driver);
    await navbar.findElement(By.css('.signup')).click();

    const form = await driver.wait(until.elementLocated(By.css('form')), 10000);

    assert.exists(form);
  });

  it('Trip details from main', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/main');

    const trip = await driver.findElement(By.css('.wycieczka'));
    const details = await trip.findElements(By.css('a'));
    await details[1].click();

    const programWycieczki = await driver.wait(until.elementLocated(By.css('.prog')), 10000);

    assert.exists(programWycieczki);
  });

  it('Logout after login', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/main');

    const navbar = await getNavbar(driver);
    await navbar.findElement(By.css('.login')).click();

    await driver.wait(until.elementLocated(By.css('form')), 10000);

    await userSignInFill(driver, {
      email: 'testuser@test.com',
      password: 'test1234',
    });

    await driver.findElement(By.css('button')).click();

    const logoutButton = await driver.wait(until.elementLocated(By.css('.logout')), 10000);
    await logoutButton.click();

    const spisWycieczek = await driver.wait(until.elementLocated(By.css('.trip_list')), 10000);

    assert.exists(spisWycieczek);
  });

  it('Profile after login', async () => {
    await driver.get('http://localhost:3000/logout');
    await driver.get('http://localhost:3000/main');

    const navbar = await getNavbar(driver);
    await navbar.findElement(By.css('.login')).click();

    await driver.wait(until.elementLocated(By.css('form')), 10000);

    await userSignInFill(driver, {
      email: 'testuser@test.com',
      password: 'test1234',
    });

    await driver.findElement(By.css('button')).click();

    const mainPageLogoButton = await driver.wait(until.elementLocated(By.css('#logo')), 10000);
    await mainPageLogoButton.click();

    const profileButton = await driver.wait(until.elementLocated(By.css('.prof')), 10000);
    await profileButton.click();

    const spisZgloszen = await driver.wait(until.elementLocated(By.css('.spis_zgloszen')), 10000);

    assert.exists(spisZgloszen);
  });

  after(async () => {
    await driver.quit();
  });
});