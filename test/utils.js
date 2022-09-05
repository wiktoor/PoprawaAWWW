const { promises: fsp } = require('fs');

async function takeScreenshot(driver, file) {
  const image = await driver.takeScreenshot();
  await fsp.writeFile(file, image, 'base64');
}

const { By } = require('selenium-webdriver');

async function userSignUpFill(driver, data) {
  const fname = await driver.findElement(By.name('first_name'));
  await fname.clear();
  await fname.sendKeys(data.first_name);
  const lname = await driver.findElement(By.name('last_name'));
  await lname.clear();
  await lname.sendKeys(data.last_name);
  const email = await driver.findElement(By.name('email'));
  await email.clear();
  await email.sendKeys(data.email);
  const password = await driver.findElement(By.name('password'));
  await password.clear();
  await password.sendKeys(data.password);
  const passwordConf = await driver.findElement(By.name('password_conf'));
  await passwordConf.clear();
  await passwordConf.sendKeys(data.password_conf);
}

async function userSignInFill(driver, data) {
  const email = await driver.findElement(By.name('email'));
  await email.clear();
  await email.sendKeys(data.email);
  const password = await driver.findElement(By.name('password'));
  await password.clear();
  await password.sendKeys(data.password);
}

async function bookFill(driver, data) {
  const fname = await driver.findElement(By.name('first_name'));
  await fname.clear();
  await fname.sendKeys(data.first_name);
  const lname = await driver.findElement(By.name('last_name'));
  await lname.clear();
  await lname.sendKeys(data.last_name);
  const email = await driver.findElement(By.name('email'));
  await email.clear();
  await email.sendKeys(data.email);
  const num = await driver.findElement(By.name('liczba_miejsc'));
  await num.clear();
  await num.sendKeys(String(data.liczba_miejsc));
}

async function getNavbar(driver) {
  return driver.findElement(By.css('nav'));
}

exports.userSignUpFill = userSignUpFill;
exports.userSignInFill = userSignInFill;
exports.bookFill = bookFill;
exports.getNavbar = getNavbar;
exports.takeScreenshot = takeScreenshot;