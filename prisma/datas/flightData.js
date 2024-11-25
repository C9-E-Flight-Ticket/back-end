const flightData = [
  {
    flightNumber: "GA-401",
    departureTime: new Date("2024-03-20T10:00:00.000Z"),
    arrivalTime: new Date("2024-03-20T12:00:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 2  // DPS (Denpasar)
  },
  {
    flightNumber: "GA-402",
    departureTime: new Date("2024-03-20T14:00:00.000Z"),
    arrivalTime: new Date("2024-03-20T16:00:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 2, // DPS (Denpasar)
    arrivalAirportId: 1  // CGK (Jakarta)
  },
  {
    flightNumber: "SQ-185",
    departureTime: new Date("2024-03-21T08:00:00.000Z"),
    arrivalTime: new Date("2024-03-21T11:00:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 3  // SIN (Singapore)
  },
  {
    flightNumber: "SQ-186",
    departureTime: new Date("2024-03-21T13:00:00.000Z"),
    arrivalTime: new Date("2024-03-21T16:00:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 3, // SIN (Singapore)
    arrivalAirportId: 1  // CGK (Jakarta)
  },
  {
    flightNumber: "EK-357",
    departureTime: new Date("2024-03-22T00:00:00.000Z"),
    arrivalTime: new Date("2024-03-22T05:00:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 4  // DXB (Dubai)
  },
  {
    flightNumber: "EK-404",
    departureTime: new Date("2024-03-22T09:00:00.000Z"),
    arrivalTime: new Date("2024-03-22T12:30:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 3, // SIN (Singapore)
    arrivalAirportId: 4  // DXB (Dubai)
  },
  {
    flightNumber: "BA-016",
    departureTime: new Date("2024-03-22T14:00:00.000Z"),
    arrivalTime: new Date("2024-03-22T22:00:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 5  // LHR (London)
  },
  {
    flightNumber: "QR-001",
    departureTime: new Date("2024-03-22T23:00:00.000Z"),
    arrivalTime: new Date("2024-03-23T05:00:00.000Z"),
    airlineId: 7, // Qatar Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 4  // DXB (Dubai)
  },
  {
    flightNumber: "DL-100",
    departureTime: new Date("2024-03-23T10:00:00.000Z"),
    arrivalTime: new Date("2024-03-23T22:00:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6  // JFK (New York)
  },
  {
    flightNumber: "AA-201",
    departureTime: new Date("2024-03-23T15:00:00.000Z"),
    arrivalTime: new Date("2024-03-24T03:00:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5  // LHR (London)
  },
  {
    flightNumber: "UA-301",
    departureTime: new Date("2024-03-24T08:00:00.000Z"),
    arrivalTime: new Date("2024-03-24T11:00:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7  // LAX (Los Angeles)
  },
  {
    flightNumber: "AA-302",
    departureTime: new Date("2024-03-24T14:00:00.000Z"),
    arrivalTime: new Date("2024-03-24T17:00:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6  // JFK (New York)
  },
  {
    flightNumber: "NH-801",
    departureTime: new Date("2024-03-25T09:00:00.000Z"),
    arrivalTime: new Date("2024-03-25T23:00:00.000Z"),
    airlineId: 1, // Using Garuda for this route (partnership)
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8  // HND (Tokyo)
  },
  {
    flightNumber: "JL-802",
    departureTime: new Date("2024-03-26T01:00:00.000Z"),
    arrivalTime: new Date("2024-03-26T15:00:00.000Z"),
    airlineId: 2, // Using Singapore Airlines for this route (partnership)
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7  // LAX (Los Angeles)
  },
  {
    flightNumber: "KE-701",
    departureTime: new Date("2024-03-26T10:00:00.000Z"),
    arrivalTime: new Date("2024-03-26T12:00:00.000Z"),
    airlineId: 2, // Using Singapore Airlines for this route (partnership)
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 9  // ICN (Seoul)
  },
  {
    flightNumber: "OZ-702",
    departureTime: new Date("2024-03-26T15:00:00.000Z"),
    arrivalTime: new Date("2024-03-26T17:00:00.000Z"),
    airlineId: 1, // Using Garuda for this route (partnership)
    departureAirportId: 9, // ICN (Seoul)
    arrivalAirportId: 8  // HND (Tokyo)
  },
  {
    flightNumber: "CX-501",
    departureTime: new Date("2024-03-27T08:00:00.000Z"),
    arrivalTime: new Date("2024-03-27T11:00:00.000Z"),
    airlineId: 2, // Using Singapore Airlines for this route (partnership)
    departureAirportId: 9, // ICN (Seoul)
    arrivalAirportId: 10  // HKG (Hong Kong)
  },
  {
    flightNumber: "CX-502",
    departureTime: new Date("2024-03-27T14:00:00.000Z"),
    arrivalTime: new Date("2024-03-27T17:00:00.000Z"),
    airlineId: 1, // Using Garuda for this route (partnership)
    departureAirportId: 10, // HKG (Hong Kong)
    arrivalAirportId: 9  // ICN (Seoul)
  },
  {
    flightNumber: "KL-201",
    departureTime: new Date("2024-03-28T09:00:00.000Z"),
    arrivalTime: new Date("2024-03-28T15:00:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11  // AMS (Amsterdam)
  },
  {
    flightNumber: "KL-202",
    departureTime: new Date("2024-03-28T17:00:00.000Z"),
    arrivalTime: new Date("2024-03-28T23:00:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5  // LHR (London)
  },
  {
    flightNumber: "LH-301",
    departureTime: new Date("2024-03-29T08:00:00.000Z"),
    arrivalTime: new Date("2024-03-29T10:00:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 12  // FRA (Frankfurt)
  },
  {
    flightNumber: "LH-302",
    departureTime: new Date("2024-03-29T12:00:00.000Z"),
    arrivalTime: new Date("2024-03-29T14:00:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 12, // FRA (Frankfurt)
    arrivalAirportId: 11  // AMS (Amsterdam)
  }
];

module.exports = { flightData };