const airportData = [
  {
    id: 1,
    name: "Soekarno-Hatta International Airport",
    code: "CGK",
    city: "Jakarta",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/cgk1.jpg",
    fileId: "cgk124"
  },
  {
    id: 2,
    name: "Ngurah Rai International Airport",
    code: "DPS",
    city: "Denpasar",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/dps.jpg",
    fileId: "dps456"
  },
  {
    id: 3,
    name: "Changi Airport",
    code: "SIN",
    city: "Singapore",
    terminalName: "Terminal 3",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/sin.jpg",
    fileId: "sin001"
  },
  {
    id: 4,
    name: "Dubai International Airport",
    code: "DXB",
    city: "Dubai",
    terminalName: "Terminal 2",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/dxb.jpg",
    fileId: "dxb002"
  },
  {
    id: 5,
    name: "Heathrow Airport",
    code: "LHR",
    city: "London",
    terminalName: "Terminal 5",
    terminalCategory: "International",
    continent: "Europe",
    urlImage: "https://example.com/lhr.jpg",
    fileId: "lhr003"
  },
  {
    id: 6,
    name: "John F. Kennedy International Airport",
    code: "JFK",
    city: "New York",
    terminalName: "Terminal 4",
    terminalCategory: "International",
    continent: "North America",
    urlImage: "https://example.com/jfk.jpg",
    fileId: "jfk004"
  },
  {
    id: 7,
    name: "Los Angeles International Airport",
    code: "LAX",
    city: "Los Angeles",
    terminalName: "Tom Bradley International Terminal",
    terminalCategory: "International",
    continent: "North America",
    urlImage: "https://example.com/lax.jpg",
    fileId: "lax005"
  },
  {
    id: 8,
    name: "Tokyo Haneda Airport",
    code: "HND",
    city: "Tokyo",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/hnd.jpg",
    fileId: "hnd006"
  },
  {
    id: 9,
    name: "Incheon International Airport",
    code: "ICN",
    city: "Seoul",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/icn.jpg",
    fileId: "icn007"
  },
  {
    id: 10,
    name: "Hong Kong International Airport",
    code: "HKG",
    city: "Hong Kong",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/hkg.jpg",
    fileId: "hkg008"
  },
  {
    id: 11,
    name: "Amsterdam Airport Schiphol",
    code: "AMS",
    city: "Amsterdam",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Europe",
    urlImage: "https://example.com/ams.jpg",
    fileId: "ams009"
  },
  {
    id: 12,
    name: "Frankfurt Airport",
    code: "FRA",
    city: "Frankfurt",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Europe",
    urlImage: "https://example.com/fra.jpg",
    fileId: "fra010"
  },
  {
    id: 13,
    name: "Singapore Changi Airport",
    code: "SIN",
    city: "Singapore",
    terminalName: "Terminal 2",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/sin2.jpg",
    fileId: "sin011"
  },
  {
    id: 14,
    name: "San Francisco International Airport",
    code: "SFO",
    city: "San Francisco",
    terminalName: "International Terminal",
    terminalCategory: "International",
    continent: "North America",
    urlImage: "https://example.com/sfo.jpg",
    fileId: "sfo012"
  },
  {
    id: 15,
    name: "Toronto Pearson International Airport",
    code: "YYZ",
    city: "Toronto",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "North America",
    urlImage: "https://example.com/yyz.jpg",
    fileId: "yyz013"
  },
  {
    id: 16,
    name: "Sydney Kingsford Smith Airport",
    code: "SYD",
    city: "Sydney",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Australia",
    urlImage: "https://example.com/syd.jpg",
    fileId: "syd014"
  },
  {
    id: 17,
    name: "Cairo International Airport",
    code: "CAI",
    city: "Cairo",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Africa",
    urlImage: "https://example.com/cai.jpg",
    fileId: "cai015"
  },
  {
    id: 18,
    name: "São Paulo/Guarulhos–Governador André Franco Montoro International Airport",
    code: "GRU",
    city: "São Paulo",
    terminalName: "Terminal 3",
    terminalCategory: "International",
    continent: "South America",
    urlImage: "https://example.com/gru.jpg",
    fileId: "gru016"
  },
  {
    id: 19,
    name: "Mexico City International Airport",
    code: "MEX",
    city: "Mexico City",
    terminalName: "Terminal 2",
    terminalCategory: "International",
    continent: "North America",
    urlImage: "https://example.com/mex.jpg",
    fileId: "mex017"
  },
  {
    id: 20,
    name: "Bangkok Suvarnabhumi Airport",
    code: "BKK",
    city: "Bangkok",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Asia",
    urlImage: "https://example.com/bkk.jpg",
    fileId: "bkk018"
  },
  {
    id: 21,
    name: "Lisbon Portela Airport",
    code: "LIS",
    city: "Lisbon",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Europe",
    urlImage: "https://example.com/lis.jpg",
    fileId: "lis019"
  },
  {
    id: 22,
    name: "Vienna International Airport",
    code: "VIE",
    city: "Vienna",
    terminalName: "Terminal 1",
    terminalCategory: "International",
    continent: "Europe",
    urlImage: "https://example.com/vie.jpg",
    fileId: "vie020"
  }
]

module.exports = { airportData }
