const bcrypt = require('bcrypt');

const saltRounds = 10;

async function signUp(db, form) {
  return db.sequelize.transaction(async (t) => {
    const userWithSameEmail = await db.User.findOne({
      where: {
        email: form.email,
      },
    }, { transaction: t });
    if (userWithSameEmail) {
      throw new Error('Uzytkownik o takim adresie email juz istnieje');
    }
    const hashed = await bcrypt.hash(form.password, saltRounds);
    const copyForm = form;
    copyForm.password = hashed;

    const newUser = await db.User.create(copyForm, { transaction: t });
    const zgloszeniaWithSameEmail = await db.Zgloszenie.findAll({
      where: {
        email: form.email,
      },
      transaction: t,
    });

    newUser.addZgloszenies(zgloszeniaWithSameEmail);
    return newUser;
  });
}

module.exports = signUp;