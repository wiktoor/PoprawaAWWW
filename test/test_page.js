const { equal } = require('assert');
const {
  Builder, By, until,
} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getDb } = require('../database/database');
const { initFunc } = require('../database/init_db');
const { takeScreenshot } = require('./utils');
const fill = require('./selenium_fill_form');
require('../app');

describe('Selenium trip page tests', () => {
  const TIMEOUT = 10000;
  let driver;
  let db;
  const errorMessage = 'Nie znaleziono strony o podanym adresie!';

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

  it('Should go to error page and check if error message is displayed', async () => {
    await driver.get('http://localhost:3000/err');
    const msg = await driver.findElement(By.css('h1')).getText();
    equal(errorMessage, msg);
  });

  it('Sends a valid form, should get redirected', async () => {
    const succValidMsg = 'Pomyslnie wyslano zgloszenie';
    await driver.get('http://localhost:3000/book/1');
    await takeScreenshot(driver, 'form_before.png');
    await fill(driver, {
      first_name: 'Radosław',
      last_name: 'Radosny',
      email: 'superradzio@wp.pl',
      liczba_miejsc: 2,
    });
    await takeScreenshot(driver, 'form_after.png');
    await driver.findElement(By.name('rezerwuj')).click();
    const succMsg = await (await driver.wait(until.elementLocated(By.css('.succ')), 10000)).getText();

    equal(succValidMsg, succMsg);
  });

  after(async () => {
    await driver.quit();
    await db.Zgloszenie.drop();
    await db.Wycieczka.drop();
  });
});