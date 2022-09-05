const { Op } = require('sequelize');

async function getActTrips(db) {
  const result = await db.sequelize.transaction(async (t) => db.Wycieczka.findAll({
    where: {
      data_poczatku: {
        [Op.gte]: new Date(Date.now()),
      },
    },
  }, { transaction: t }));

  return result;
}

async function getTripById(db, id) {
  const result = await db.sequelize.transaction(
    async (t) => db.Wycieczka.findByPk(parseInt(id, 10), { transaction: t }),
  );
  return result;
}

async function getUserBookings(db, email) {
  const result = await db.sequelize.transaction(async (t) => {
    const user = await db.User.findOne({
      where: {
        email,
      },
      transaction: t,
    });
    const bookings = await user.getZgloszenies({ transaction: t });

    return {
      user,
      bookings,
    };
  });
  return result;
}

const getWycieczka = async (db, id, t = null) => ({
  wycieczka: await db.Wycieczka.findByPk(id, {
    transaction: t,
    lock: true,
  }),
  zgloszenia: await db.Zgloszenie.findAll({
    where: {
      myWycieczkaId: id,
    },
    transaction: t,
    lock: true,
  }),
});

async function getUser(db, email) {
  const result = await db.sequelize.transaction(async (t) => {
    const user = await db.User.findOne({
      where: {
        email,
      },
      transaction: t,
    });
    return user;
  });
  return result;
}

exports.getActTrips = getActTrips;
exports.getTripById = getTripById;
exports.getUserBookings = getUserBookings;
exports.getUser = getUser;
exports.getWycieczka = getWycieczka;