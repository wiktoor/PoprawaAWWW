const { By } = require('selenium-webdriver');

async function fill(driver, formData) {
  const fname = await driver.findElement(By.name('first_name'));
  await fname.clear();
  await fname.sendKeys(formData.first_name);
  const lname = await driver.findElement(By.name('last_name'));
  await lname.clear();
  await lname.sendKeys(formData.last_name);
  const email = await driver.findElement(By.name('email'));
  await email.clear();
  await email.sendKeys(formData.email);
  const num = await driver.findElement(By.name('liczba_miejsc'));
  await num.clear();
  await num.sendKeys(String(formData.liczba_miejsc));
}

module.exports = fill;