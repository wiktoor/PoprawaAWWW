const { Sequelize, DataTypes } = require('sequelize');
const config = require('config');
const wycieczkaModel = require('./wycieczka');
const zgloszenieModel = require('./zgloszenie');
const userModel = require('./user');

const sequelize = new Sequelize('bd', 'wc429131', '2dzi1ase3lka7', {
    host: 'lkdb',
    dialect: 'postgres'
});

const getDb = async () => {
  try {

    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');

    const db = {};

    db.sequelize = sequelize;

    db.Wycieczka = wycieczkaModel(sequelize, Sequelize, DataTypes);

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

    await db.sequelize.sync();

    return db;
  } catch (error) {
    console.error('Nie udalo siie nawiazac polaczenia');
    throw error;
  }
};

exports.getDb = getDb;