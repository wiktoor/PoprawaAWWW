const { Sequelize, DataTypes } = require('sequelize');
const config = require('config');
const wycieczkaModel = require('./wycieczka');
const zgloszenieModel = require('./zgloszenie');
const userModel = require('./user');

// Połączenie z bazą danych
const sequelize = new Sequelize('bd', 'wc429131', '2dzi1ase3lka7', {
    host: 'lkdb',
    dialect: 'postgres'
});

const getDb = async () => {
  try {
    // Sprawdzenie poprawności połączenia ]

    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    const db = {};

    db.sequelize = sequelize;

    // // Uzupełnij treść modułu wycieczka.js implementującego model Wycieczka
    db.Wycieczka = wycieczkaModel(sequelize, Sequelize, DataTypes);

    // // Uzupełnij treść modułu zgloszenie.js implementującego model Zgloszenie
    db.Zgloszenie = zgloszenieModel(sequelize, Sequelize, DataTypes);

    db.User = userModel(sequelize, Sequelize, DataTypes);

    db.Wycieczka.hasMany(db.Zgloszenie, {
      foreignKey: {
        name: 'myWycieczkaId',
        allowNull: false,
      },
      onDelete: 'CASCADE',
    });
    db.Zgloszenie.belongsTo(db.Wycieczka, { foreignKey: 'myWycieczkaId' });
    db.User.hasMany(db.Zgloszenie, {
      foreignKey: 'myUserID',
    });
    db.Zgloszenie.belongsTo(db.User, { foreignKey: 'myUserID' });

    // Synchronizacja
    await db.sequelize.sync();

    return db;
  } catch (error) {
    console.error('Nie udalo siie nawiazac polaczenia');
    throw error;
  }
};

exports.getDb = getDb;