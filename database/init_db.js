const bcrypt = require('bcrypt');

const saltRounds = 10;

exports.initFunc = async (db) => {
  console.error('Trying to initialize database with test values...');

  // Synchronizacja
  try {
    await db.sequelize.sync({ force: true });
    const miasto = await db.Wycieczka.create({
      nazwa: 'Miasto',
      opis: 'Wycieczka do ciekawego miasta.',
      krotki_opis: 'Fajnie jest w mieście',
      obrazek: '/img/bahamas.jpg',
      obrazek_tekst: 'Zdjęcie miasta',
      cena: 1750.50,
      data_poczatku: new Date('2022-12-12'),
      data_konca: new Date('2023-01-01'),
      liczba_dostepnych_miejsc: 10,
    });

    const gory = await db.Wycieczka.create({
      nazwa: 'Góry',
      opis: 'Wycieczka do ciekawych gór.',
      krotki_opis: 'Fajnie jest w górach',
      obrazek: '/img/bali.jpg',
      obrazek_tekst: 'Zdjęcie szczytu',
      cena: 1350.50,
      data_poczatku: new Date('2024-12-12'),
      data_konca: new Date('2025-01-01'),
      liczba_dostepnych_miejsc: 8,
    });

    const morza = await db.Wycieczka.create({
      nazwa: 'Morza',
      opis: 'Mórz jest wiele, więc i opis może być nieco dłuższy niż poprzednio. Atrakcji też może być więcej.',
      krotki_opis: 'Fajnie jest w górach',
      obrazek: '/img/fuertaventura.jpg',
      obrazek_tekst: 'Zdjęcie morza',
      cena: 17.30,
      data_poczatku: new Date('2021-10-10'),
      data_konca: new Date('2021-11-11'),
      liczba_dostepnych_miejsc: 8,
    });

    const zgloszenie1 = await miasto.createZgloszenie({
      imie: 'Anna',
      nazwisko: 'Kaliska',
      email: 'anna.kaliska@wp.pl',
      liczba_miejsc: 2,
    });

    const zgloszenie2 = await miasto.createZgloszenie({
      imie: 'Mateusz',
      nazwisko: 'Maniowski',
      email: 'mateusz.maniowski@wp.pl',
      liczba_miejsc: 3,
    });

    const user1 = await db.User.create({
      first_name: 'testuser',
      last_name: 'testuser',
      email: 'testuser@test.com',
      password: await bcrypt.hash('test1234', saltRounds),
    });

    user1.addZgloszenie(zgloszenie1);
    user1.addZgloszenie(zgloszenie2);
    console.error('Successfully initialized the database');
  } catch (error) {
    console.log('An error occurred during data loading');
    console.log(error);
  }
};

