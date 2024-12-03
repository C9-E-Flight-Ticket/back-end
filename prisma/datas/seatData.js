function generateSeats(flightId) {
  const seats = [];

  // First Class: Baris 1-2, Kolom A-D
  for (let row = 1; row <= 2; row++) {
    for (const column of ['A', 'B', 'C', 'D']) {
      seats.push({
        flightId: flightId,
        seatNumber: `${row}${column}`,
        seatClass: 'First Class',
        price: 3000000,
        available: true,
      });
    }
  }

  // Business Class: Baris 3-6, Kolom A-D
  for (let row = 3; row <= 6; row++) {
    for (const column of ['A', 'B', 'C', 'D']) {
      seats.push({
        flightId: flightId,
        seatNumber: `${row}${column}`,
        seatClass: 'Business',
        price: 1500000,
        available: true,
      });
    }
  }

  // Premium Economy: Baris 7-12, Kolom A-F
  for (let row = 7; row <= 12; row++) {
    for (const column of ['A', 'B', 'C', 'D', 'E', 'F']) {
      seats.push({
        flightId: flightId,
        seatNumber: `${row}${column}`,
        seatClass: 'Premium Economy',
        price: 1000000,
        available: true,
      });
    }
  }

  // Economy Class: Baris 13-24, Kolom A-F
  for (let row = 13; row <= 24; row++) {
    for (const column of ['A', 'B', 'C', 'D', 'E', 'F']) {
      seats.push({
        flightId: flightId,
        seatNumber: `${row}${column}`,
        seatClass: 'Economy',
        price: 800000,
        available: true,
      });
    }
  }

  return seats;
}

module.exports = {
  generateSeats,
};
