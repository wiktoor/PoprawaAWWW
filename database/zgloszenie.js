module.exports = (sequelize, Sequelize, DataTypes) => {
  
    const Zgloszenie = sequelize.define('Zgloszenie', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      imie: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nazwisko: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      liczba_miejsc: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
    return Zgloszenie;
  };