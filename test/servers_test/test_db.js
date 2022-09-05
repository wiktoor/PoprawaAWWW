const { equal, deepEqual } = require('assert');
const { getDb } = require('../../database/database');
const { initFunc } = require('../../database/init_db');
const {
  getActTrips, getWycieczka, getTripById, getUserBookings, getUser,
} = require('../../database/query');

module.exports = describe('Database functions/utilities tests', () => {
  let db;
  before(async () => {
    db = await getDb();
    await initFunc(db);
  });

  it('Czy zgłoszenia przypisane do wycieczki pk=1 się zgadzają', async () => {
    const id = 1;
    const t = null;
    const zgloszeniaWycieczkiPk1 = await db.Zgloszenie.findAll({
      where: {
        myWycieczkaId: id,
      },
      transaction: t,
      lock: true,
    });
    const zgloszeniaZFunkcji = await getWycieczka(db, id);
    deepEqual(zgloszeniaWycieczkiPk1, zgloszeniaZFunkcji.zgloszenia);
  });

  it('Czy pobiera wylacznie zgloszenia >= od dzis', async () => {
    const wycieczki = await getActTrips(db);
    equal(2, wycieczki.length);
  });

  it('getTripById test', async () => {
    const wynikFunkcji = await getTripById(db, 1);
    const wycieczkaRaw = await db.sequelize.transaction(
      async (t) => db.Wycieczka.findByPk(1, { transaction: t }),
    );
    deepEqual(wycieczkaRaw, wynikFunkcji);
    equal('Miasto', wycieczkaRaw.nazwa);
  });

  it('getUserBookings test', async () => {
    const wynikFunkcji = await getUserBookings(db, 'testuser@test.com');
    const userAndBookingsRaw = await db.sequelize.transaction(async (t) => {
      const user = await db.User.findOne({
        where: {
          email: 'testuser@test.com',
        },
        transaction: t,
      });
      const bookings = await user.getZgloszenies({ transaction: t });

      return {
        user,
        bookings,
      };
    });
    deepEqual(userAndBookingsRaw.user, wynikFunkcji.user);
    equal(2, userAndBookingsRaw.bookings.length);
    equal('testuser', userAndBookingsRaw.user.first_name);
  });

  it('getWycieczka test', async () => {
    const wynikFunkcji = await getWycieczka(db, 1);
    const t = null;
    const wycieczkaAndZgloszeniaRaw = {
      wycieczka: await db.Wycieczka.findByPk(1, {
        transaction: t,
        lock: true,
      }),
      zgloszenia: await db.Zgloszenie.findAll({
        where: {
          myWycieczkaId: 1,
        },
        transaction: t,
        lock: true,
      }),
    };

    deepEqual(wycieczkaAndZgloszeniaRaw, wynikFunkcji);
    equal('Miasto', wycieczkaAndZgloszeniaRaw.wycieczka.nazwa);
    equal(2, wycieczkaAndZgloszeniaRaw.zgloszenia.length);
  });

  it('getUser test', async () => {
    const wynikFunkcji = await getUser(db, 'testuser@test.com');
    const userRaw = await db.sequelize.transaction(async (t) => {
      const user = await db.User.findOne({
        where: {
          email: 'testuser@test.com',
        },
        transaction: t,
      });
      return user;
    });
    deepEqual(userRaw, wynikFunkcji);
    deepEqual(userRaw.first_name, 'testuser');
  });

  after(async () => {
    await db.Zgloszenie.drop();
    await db.Wycieczka.drop();
  });
});