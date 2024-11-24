function generateSeats(flightId) {
  const seats = [];
  const rows = 12;
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let row = 1; row <= rows; row++) {
    for (const column of columns) {
      let seatClass;
      let price;
      
      if (row <= 2) {
        seatClass = 'Business';
        price = 1500000;
      } else {
        seatClass = 'Economy';
        price = 800000;
      }

      let available = true;
      if (
        (row === 1 && column !== 'D') ||
        (row === 2 && ['D', 'E', 'F'].includes(column)) ||
        (row === 3 && ['A', 'B', 'C'].includes(column)) ||
        row === 10 ||
        (row === 11 && ['D', 'E', 'F'].includes(column))
      ) {
        available = false;
      }

      seats.push({
        flightId: flightId,
        seatNumber: `${row}${column}`,
        seatClass: seatClass,
        price: price,
        available: available
      });
    }
  }

  return seats;
}

module.exports = {
  generateSeats
};
