const flightData = [
  {
    flightNumber: "GA-401",
    departureTime: new Date("2024-12-20T07:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T09:15:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 2, // DPS (Denpasar)
  },
  {
    flightNumber: "GA-402",
    departureTime: new Date("2024-12-20T12:45:00.000Z"),
    arrivalTime: new Date("2024-12-20T14:30:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 2, // DPS (Denpasar)
  },
  {
    flightNumber: "GA-403",
    departureTime: new Date("2024-12-20T16:45:00.000Z"),
    arrivalTime: new Date("2024-12-20T18:30:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 2, // DPS (Denpasar)
  },
  {
    flightNumber: "GA-404",
    departureTime: new Date("2024-12-20T21:15:00.000Z"),
    arrivalTime: new Date("2024-12-20T23:00:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 2, // DPS (Denpasar)
  },
  {
    flightNumber: "GA-405",
    departureTime: new Date("2024-12-27T07:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T09:15:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 2, // DPS (Denpasar)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "GA-406",
    departureTime: new Date("2024-12-27T12:45:00.000Z"),
    arrivalTime: new Date("2024-12-27T14:30:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 2, // DPS (Denpasar)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "GA-407",
    departureTime: new Date("2024-12-27T16:45:00.000Z"),
    arrivalTime: new Date("2024-12-27T18:30:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 2, // DPS (Denpasar)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "GA-408",
    departureTime: new Date("2024-12-27T21:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T23:00:00.000Z"),
    airlineId: 1, // Garuda Indonesia
    departureAirportId: 2, // DPS (Denpasar)
    arrivalAirportId: 1, // CGK (Jakarta)
  },

  //////////////////////////

  {
    flightNumber: "SQ-171",
    departureTime: new Date("2024-12-20T07:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T09:30:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 3, // SIN (Singapura)
  },
  {
    flightNumber: "SQ-172",
    departureTime: new Date("2024-12-20T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T15:00:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 3, // SIN (Singapura)
  },
  {
    flightNumber: "SQ-173",
    departureTime: new Date("2024-12-20T16:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T18:30:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 3, // SIN (Singapura)
  },
  {
    flightNumber: "SQ-174",
    departureTime: new Date("2024-12-20T20:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T23:00:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 3, // SIN (Singapura)
  },

  {
    flightNumber: "SQ-181",
    departureTime: new Date("2024-12-27T10:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T11:30:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 3, // SIN (Singapura)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "SQ-182",
    departureTime: new Date("2024-12-27T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T16:30:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 3, // SIN (Singapura)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "SQ-183",
    departureTime: new Date("2024-12-27T19:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T20:30:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 3, // SIN (Singapura)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "SQ-184",
    departureTime: new Date("2024-12-27T22:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T23:30:00.000Z"),
    airlineId: 2, // Singapore Airlines
    departureAirportId: 3, // SIN (Singapura)
    arrivalAirportId: 1, // CGK (Jakarta)
  },

  //////////////////////////

  {
    flightNumber: "EK-351",
    departureTime: new Date("2024-12-20T07:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T15:25:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "EK-352",
    departureTime: new Date("2024-12-20T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T20:55:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "EK-353",
    departureTime: new Date("2024-12-20T16:00:00.000Z"),
    arrivalTime: new Date("2024-12-21T00:25:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "EK-354",
    departureTime: new Date("2024-12-20T20:30:00.000Z"),
    arrivalTime: new Date("2024-12-21T04:55:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 1, // CGK (Jakarta)
    arrivalAirportId: 4, // DXB (Dubai)
  },

  {
    flightNumber: "EK-355",
    departureTime: new Date("2024-12-27T07:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T15:25:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "EK-356",
    departureTime: new Date("2024-12-27T09:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T17:40:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "EK-357",
    departureTime: new Date("2024-12-27T14:45:00.000Z"),
    arrivalTime: new Date("2024-12-27T23:10:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 1, // CGK (Jakarta)
  },
  {
    flightNumber: "EK-358",
    departureTime: new Date("2024-12-27T18:15:00.000Z"),
    arrivalTime: new Date("2024-12-28T02:40:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 1, // CGK (Jakarta)
  },

  //////////////////////////
  {
    flightNumber: "EK-401",
    departureTime: new Date("2024-03-22T07:00:00.000Z"),
    arrivalTime: new Date("2024-03-22T14:40:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 3, // SIN (Singapore)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "EK-402",
    departureTime: new Date("2024-03-22T09:30:00.000Z"),
    arrivalTime: new Date("2024-03-22T17:10:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 3, // SIN (Singapore)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "EK-403",
    departureTime: new Date("2024-03-22T12:30:00.000Z"),
    arrivalTime: new Date("2024-03-22T20:10:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 3, // SIN (Singapore)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "EK-404",
    departureTime: new Date("2024-03-22T15:45:00.000Z"),
    arrivalTime: new Date("2024-03-22T23:25:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 3, // SIN (Singapore)
    arrivalAirportId: 4, // DXB (Dubai)
  },

  {
    flightNumber: "EK-405",
    departureTime: new Date("2024-03-29T07:00:00.000Z"),
    arrivalTime: new Date("2024-03-29T14:40:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 3, // SIN (Singapore)
  },
  {
    flightNumber: "EK-406",
    departureTime: new Date("2024-03-29T09:30:00.000Z"),
    arrivalTime: new Date("2024-03-29T17:10:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 3, // SIN (Singapore)
  },
  {
    flightNumber: "EK-407",
    departureTime: new Date("2024-03-29T12:30:00.000Z"),
    arrivalTime: new Date("2024-03-29T20:10:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 3, // SIN (Singapore)
  },
  {
    flightNumber: "EK-408",
    departureTime: new Date("2024-03-29T15:45:00.000Z"),
    arrivalTime: new Date("2024-03-29T23:25:00.000Z"),
    airlineId: 8, // Emirates
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 3, // SIN (Singapore)
  },

  //////////////////////////

  {
    flightNumber: "BA-016",
    departureTime: new Date("2024-12-20T08:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T16:10:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "BA-018",
    departureTime: new Date("2024-12-20T11:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T19:40:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "BA-020",
    departureTime: new Date("2024-12-20T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T23:10:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 4, // DXB (Dubai)
    arrivalAirportId: 5, // LHR (London)
  },

  {
    flightNumber: "BA-017",
    departureTime: new Date("2024-12-27T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T13:10:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "BA-019",
    departureTime: new Date("2024-12-27T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T16:40:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 4, // DXB (Dubai)
  },
  {
    flightNumber: "BA-021",
    departureTime: new Date("2024-12-27T16:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T20:10:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 4, // DXB (Dubai)
  },

  //////////////////////////

  {
    flightNumber: "DL-100",
    departureTime: new Date("2024-12-20T07:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T15:00:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "DL-102",
    departureTime: new Date("2024-12-20T10:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T18:30:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "DL-104",
    departureTime: new Date("2024-12-20T14:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T22:00:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "DL-106",
    departureTime: new Date("2024-12-27T08:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T16:15:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },

  {
    flightNumber: "DL-101",
    departureTime: new Date("2024-12-27T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T12:00:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "DL-103",
    departureTime: new Date("2024-12-27T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T15:30:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "DL-105",
    departureTime: new Date("2024-12-27T16:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T19:00:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "DL-107",
    departureTime: new Date("2024-12-27T19:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T22:30:00.000Z"),
    airlineId: 3, // Delta Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },

  //////////////////////////

  {
    flightNumber: "AA-201",
    departureTime: new Date("2024-12-20T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T17:00:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "AA-203",
    departureTime: new Date("2024-12-20T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T20:30:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "AA-205",
    departureTime: new Date("2024-12-20T16:00:00.000Z"),
    arrivalTime: new Date("2024-12-21T00:00:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "AA-207",
    departureTime: new Date("2024-12-27T10:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T18:15:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 5, // LHR (London)
  },

  {
    flightNumber: "AA-202",
    departureTime: new Date("2024-12-27T08:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T16:00:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "AA-204",
    departureTime: new Date("2024-12-27T11:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T19:30:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "AA-206",
    departureTime: new Date("2024-12-27T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T23:00:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "AA-208",
    departureTime: new Date("2024-12-27T18:30:00.000Z"),
    arrivalTime: new Date("2024-12-28T02:30:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 6, // JFK (New York)
  },

  //////////////////////////

  {
    flightNumber: "UA-301",
    departureTime: new Date("2024-12-20T07:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T12:10:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "UA-303",
    departureTime: new Date("2024-12-20T10:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T15:40:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "UA-305",
    departureTime: new Date("2024-12-20T14:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T19:10:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "UA-307",
    departureTime: new Date("2024-12-27T08:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T13:25:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },

  {
    flightNumber: "UA-302",
    departureTime: new Date("2024-12-27T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T12:10:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "UA-304",
    departureTime: new Date("2024-12-27T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T15:40:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "UA-306",
    departureTime: new Date("2024-12-27T16:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T19:10:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "UA-308",
    departureTime: new Date("2024-12-27T19:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T22:40:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },

  //////////////////////////

  {
    flightNumber: "AA-302",
    departureTime: new Date("2024-12-20T08:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T16:19:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "AA-304",
    departureTime: new Date("2024-12-20T11:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T19:49:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "AA-306",
    departureTime: new Date("2024-12-20T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T23:19:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },
  {
    flightNumber: "AA-308",
    departureTime: new Date("2024-12-27T09:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T17:34:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 6, // JFK (New York)
  },

  {
    flightNumber: "AA-301",
    departureTime: new Date("2024-12-27T07:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T15:19:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "AA-303",
    departureTime: new Date("2024-12-27T10:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T18:49:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "AA-305",
    departureTime: new Date("2024-12-27T14:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T22:19:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "AA-307",
    departureTime: new Date("2024-12-27T17:30:00.000Z"),
    arrivalTime: new Date("2024-12-28T01:49:00.000Z"),
    airlineId: 4, // American Airlines
    departureAirportId: 6, // JFK (New York)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },

  //////////////////////////

  {
    flightNumber: "NH-801",
    departureTime: new Date("2024-12-20T11:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T23:00:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },
  {
    flightNumber: "NH-803",
    departureTime: new Date("2024-12-20T14:30:00.000Z"),
    arrivalTime: new Date("2024-12-21T02:30:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },
  {
    flightNumber: "NH-805",
    departureTime: new Date("2024-12-20T18:00:00.000Z"),
    arrivalTime: new Date("2024-12-21T06:00:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },
  {
    flightNumber: "NH-807",
    departureTime: new Date("2024-12-27T09:15:00.000Z"),
    arrivalTime: new Date("2024-12-27T21:15:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },

  {
    flightNumber: "NH-802",
    departureTime: new Date("2024-12-28T10:00:00.000Z"),
    arrivalTime: new Date("2024-12-28T08:00:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "NH-804",
    departureTime: new Date("2024-12-28T13:30:00.000Z"),
    arrivalTime: new Date("2024-12-28T11:30:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "NH-806",
    departureTime: new Date("2024-12-28T17:00:00.000Z"),
    arrivalTime: new Date("2024-12-28T15:00:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "NH-808",
    departureTime: new Date("2024-12-28T20:30:00.000Z"),
    arrivalTime: new Date("2024-12-28T18:30:00.000Z"),
    airlineId: 5, // United Airlines
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },

  //////////////////////////

  {
    flightNumber: "JL-802",
    departureTime: new Date("2024-12-28T10:30:00.000Z"),
    arrivalTime: new Date("2024-12-28T22:25:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "JL-804",
    departureTime: new Date("2024-12-28T13:45:00.000Z"),
    arrivalTime: new Date("2024-12-29T01:40:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "JL-806",
    departureTime: new Date("2024-12-28T16:15:00.000Z"),
    arrivalTime: new Date("2024-12-29T04:10:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },
  {
    flightNumber: "JL-808",
    departureTime: new Date("2024-12-28T19:00:00.000Z"),
    arrivalTime: new Date("2024-12-29T06:55:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 8, // HND (Tokyo)
    arrivalAirportId: 7, // LAX (Los Angeles)
  },

  {
    flightNumber: "JL-801",
    departureTime: new Date("2024-12-20T11:45:00.000Z"),
    arrivalTime: new Date("2024-12-20T23:40:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },
  {
    flightNumber: "JL-803",
    departureTime: new Date("2024-12-20T14:30:00.000Z"),
    arrivalTime: new Date("2024-12-21T02:25:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },
  {
    flightNumber: "JL-805",
    departureTime: new Date("2024-12-20T17:15:00.000Z"),
    arrivalTime: new Date("2024-12-21T05:10:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },
  {
    flightNumber: "JL-807",
    departureTime: new Date("2024-12-20T20:00:00.000Z"),
    arrivalTime: new Date("2024-12-21T07:55:00.000Z"),
    airlineId: 2, // Singapore Airlines (sesuai permintaan)
    departureAirportId: 7, // LAX (Los Angeles)
    arrivalAirportId: 8, // HND (Tokyo)
  },

  //////////////////////////

  {
    flightNumber: "KL-201",
    departureTime: new Date("2024-12-20T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T10:15:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "KL-203",
    departureTime: new Date("2024-12-20T11:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T12:45:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "KL-205",
    departureTime: new Date("2024-12-20T14:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T15:15:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "KL-207",
    departureTime: new Date("2024-12-20T16:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T17:45:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },

  {
    flightNumber: "KL-202",
    departureTime: new Date("2024-12-27T10:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T09:45:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "KL-204",
    departureTime: new Date("2024-12-27T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T11:45:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "KL-206",
    departureTime: new Date("2024-12-27T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T14:15:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "KL-208",
    departureTime: new Date("2024-12-27T17:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T16:45:00.000Z"),
    airlineId: 11, // KLM
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },

  //////////////////////////

  {
    flightNumber: "BA-201",
    departureTime: new Date("2024-12-20T10:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T11:25:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "BA-203",
    departureTime: new Date("2024-12-20T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T13:55:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "BA-205",
    departureTime: new Date("2024-12-20T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T16:25:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "BA-207",
    departureTime: new Date("2024-12-20T17:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T18:55:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 5, // LHR (London)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },

  {
    flightNumber: "BA-202",
    departureTime: new Date("2024-12-27T10:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T11:25:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "BA-204",
    departureTime: new Date("2024-12-27T12:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T13:55:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "BA-206",
    departureTime: new Date("2024-12-27T15:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T16:25:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },
  {
    flightNumber: "BA-208",
    departureTime: new Date("2024-12-27T17:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T18:55:00.000Z"),
    airlineId: 6, // British Airways
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 5, // LHR (London)
  },

  //////////////////////////

  {
    flightNumber: "LH-301",
    departureTime: new Date("2024-12-20T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T10:10:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 12, // FRA (Frankfurt)
  },
  {
    flightNumber: "LH-303",
    departureTime: new Date("2024-12-20T11:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T12:40:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 12, // FRA (Frankfurt)
  },
  {
    flightNumber: "LH-305",
    departureTime: new Date("2024-12-20T14:00:00.000Z"),
    arrivalTime: new Date("2024-12-20T15:10:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 12, // FRA (Frankfurt)
  },
  {
    flightNumber: "LH-307",
    departureTime: new Date("2024-12-20T16:30:00.000Z"),
    arrivalTime: new Date("2024-12-20T17:40:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 11, // AMS (Amsterdam)
    arrivalAirportId: 12, // FRA (Frankfurt)
  },

  {
    flightNumber: "LH-302",
    departureTime: new Date("2024-12-27T09:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T10:10:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 12, // FRA (Frankfurt)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "LH-304",
    departureTime: new Date("2024-12-27T11:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T12:40:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 12, // FRA (Frankfurt)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "LH-306",
    departureTime: new Date("2024-12-27T14:00:00.000Z"),
    arrivalTime: new Date("2024-12-27T15:10:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 12, // FRA (Frankfurt)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
  {
    flightNumber: "LH-308",
    departureTime: new Date("2024-12-27T16:30:00.000Z"),
    arrivalTime: new Date("2024-12-27T17:40:00.000Z"),
    airlineId: 9, // Lufthansa
    departureAirportId: 12, // FRA (Frankfurt)
    arrivalAirportId: 11, // AMS (Amsterdam)
  },
];

module.exports = { flightData };
