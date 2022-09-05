async function wyslijZgloszenie(db, idWycieczki, form) {
    return db.sequelize.transaction(async (t) => {
      const danaWycieczka = await db.Wycieczka.findByPk(
        parseInt(idWycieczki, 10),
        { transaction: t },
      );
      if (form.liczba_miejsc > danaWycieczka.liczba_dostepnych_miejsc) {
        throw new Error('\nNie ma tylu miejsc\n');
      }
  
      danaWycieczka.liczba_dostepnych_miejsc -= form.liczba_miejsc;
      await danaWycieczka.save({ transaction: t });
      const noweZglosz = await danaWycieczka.createZgloszenie({
        imie: form.imie,
        nazwisko: form.nazwisko,
        email: form.email,
        liczba_miejsc: form.liczba_miejsc,
      }, { transaction: t });
  
      const userWithThisEmail = await db.User.findOne({
        where: {
          email: form.email,
        },
        transaction: t,
      });
  
      if (userWithThisEmail) {
        userWithThisEmail.addZgloszenie(noweZglosz);
      }
  
      return noweZglosz;
    });
  }
  
  module.exports = wyslijZgloszenie;