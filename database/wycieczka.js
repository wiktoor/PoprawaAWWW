module.exports = (sequelize, Sequelize, DataTypes) => {
    // odkomentuj i uzupełnij argumenty metody sequelize.define
  
    const Wycieczka = sequelize.define(
      'Wycieczka',
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nazwa: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        opis: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        krotki_opis: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        obrazek: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cena: {
          type: DataTypes.DOUBLE,
          allowNull: false,
        },
        data_poczatku: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        data_konca: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        liczba_dostepnych_miejsc: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        validate: {
          koniecPoPoczatku() {
            if (this.data_konca < this.data_poczatku) {
              throw new Error('Data konca musi byc po dacie poczatku');
            }
          },
        },
        // Do uzupełnienia
      },
    );
    return Wycieczka;
  };