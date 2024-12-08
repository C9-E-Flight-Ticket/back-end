

function generateDynamicPricing(flight) {
  const baseRates = {
    routes: {
      'CGK-DPS': { basePrice: 800000, multiplier: 1.0 },
      'CGK-SIN': { basePrice: 1200000, multiplier: 1.2 },
      'CGK-DXB': { basePrice: 2500000, multiplier: 1.5 },
      'DXB-LHR': { basePrice: 3000000, multiplier: 1.7 },
      'LHR-JFK': { basePrice: 4500000, multiplier: 2.0 },
      'JFK-LAX': { basePrice: 2800000, multiplier: 1.4 },
      'LAX-HND': { basePrice: 5000000, multiplier: 2.2 },
      'AMS-FRA': { basePrice: 1000000, multiplier: 1.1 },
      'LHR-AMS': { basePrice: 900000, multiplier: 1.05 }
    },
    airlines: {
      1: 1.0,  // Garuda Indonesia
      2: 1.2,  // Singapore Airlines
      6: 1.3,  // British Airways
      8: 1.4,  // Emirates
      9: 1.1,  // Lufthansa
      11: 1.05 // KLM
    }
  };

  const routeKey = `${flight.departureAirportId}-${flight.arrivalAirportId}`;
  const routePrice = baseRates.routes[routeKey] || { basePrice: 1000000, multiplier: 1.0 };
  const airlineMultiplier = baseRates.airlines[flight.airlineId] || 1.0;

  return {
    firstClass: Math.round(routePrice.basePrice * routePrice.multiplier * airlineMultiplier * 3),
    business: Math.round(routePrice.basePrice * routePrice.multiplier * airlineMultiplier * 2),
    premiumEconomy: Math.round(routePrice.basePrice * routePrice.multiplier * airlineMultiplier * 1.5),
    economy: Math.round(routePrice.basePrice * routePrice.multiplier * airlineMultiplier)
  };
}

function generateSeats(flight) {
  const pricing = generateDynamicPricing(flight);
  const seats = [];

  // First Class: Baris 1-2, Kolom A-D
  for (let row = 1; row <= 2; row++) {
    for (const column of ['A', 'B', 'C', 'D']) {
      seats.push({
        flightId: flight.id,
        seatNumber: `${row}${column}`,
        seatClass: 'First Class',
        price: pricing.firstClass,
        available: true,
      });
    }
  }

  // Business Class: Baris 3-6, Kolom A-D
  for (let row = 3; row <= 6; row++) {
    for (const column of ['A', 'B', 'C', 'D']) {
      seats.push({
        flightId: flight.id,
        seatNumber: `${row}${column}`,
        seatClass: 'Business',
        price: pricing.business,
        available: true,
      });
    }
  }

  // Premium Economy: Baris 7-12, Kolom A-F
  for (let row = 7; row <= 12; row++) {
    for (const column of ['A', 'B', 'C', 'D', 'E', 'F']) {
      seats.push({
        flightId: flight.id,
        seatNumber: `${row}${column}`,
        seatClass: 'Premium Economy',
        price: pricing.premiumEconomy,
        available: true,
      });
    }
  }

  // Economy Class: Baris 13-24, Kolom A-F
  for (let row = 13; row <= 24; row++) {
    for (const column of ['A', 'B', 'C', 'D', 'E', 'F']) {
      seats.push({
        flightId: flight.id,
        seatNumber: `${row}${column}`,
        seatClass: 'Economy',
        price: pricing.economy,
        available: true,
      });
    }
  }

  return seats;
}

module.exports = {
  generateSeats,
  generateDynamicPricing
};