const bcrypt = require('bcrypt');

async function authenticate(db, form) {
  return db.sequelize.transaction(async (t) => {
    const user = await db.User.findOne({ where: { email: form.email } }, { transaction: t });
    if (user) {
      const res = await bcrypt.compare(form.password, user.password);
      if (res) {
        return user;
      }
    }
    throw new Error('Błędny email lub hasło');
  });
}

module.exports = authenticate;