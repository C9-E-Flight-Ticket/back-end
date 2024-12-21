const request = require('supertest');
const app = require('../app');
const prisma = require('../models/prismaClients');

describe('Transaction Integration Tests', () => {
  let authToken;
  let testFlight;
  let testSeats;
  let testBookingCode;

  beforeAll(async () => {
    // Login with an existing user and get a token for authentication
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user3@example.com',
        password: 'qwerty123',
      });

    authToken = userResponse.body.token;

    // Create test airline
    const airline = await prisma.airline.create({
      data: {
        name: 'Test Airline',
        code: 'TST',
        logo: 'test-logo.png'
      }
    });

    // Create test airports
    const departureAirport = await prisma.airport.create({
      data: {
        name: 'Test Departure Airport',
        code: 'TDA',
        city: 'Test City',
        country: 'Test Country'
      }
    });

    const arrivalAirport = await prisma.airport.create({
      data: {
        name: 'Test Arrival Airport',
        code: 'TAA',
        city: 'Test City 2',
        country: 'Test Country'
      }
    });

    // Create test flight
    testFlight = await prisma.flight.create({
      data: {
        flightNumber: 'TST123',
        airlineId: airline.id,
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        arrivalTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        price: 1000000,
        capacity: 4
      }
    });

    // Create test seats
    testSeats = await Promise.all([
      prisma.seat.create({
        data: {
          flightId: testFlight.id,
          seatNumber: 'A1',
          price: '1000000',
          available: true
        }
      }),
      prisma.seat.create({
        data: {
          flightId: testFlight.id,
          seatNumber: 'A2',
          price: '1000000',
          available: true
        }
      })
    ]);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.ticket.deleteMany({
      where: {
        flightId: testFlight.id
      }
    });
    await prisma.passenger.deleteMany({
      where: {
        flightId: testFlight.id
      }
    });
    await prisma.transaction.deleteMany({
      where: {
        bookingCode: testBookingCode
      }
    });
    await prisma.seat.deleteMany({
      where: {
        flightId: testFlight.id
      }
    });
    await prisma.flight.delete({
      where: {
        id: testFlight.id
      }
    });
    await prisma.airline.delete({
      where: {
        id: testFlight.airlineId
      }
    });
    await prisma.airport.deleteMany({
      where: {
        OR: [
          { id: testFlight.departureAirportId },
          { id: testFlight.arrivalAirportId }
        ]
      }
    });
  });

  describe('POST /api/transaction/order', () => {
    it('should create a new transaction successfully', async () => {
      const payload = {
        seats: testSeats.map(seat => seat.id),
        passengerDetails: [{
          title: 'Mr',
          name: 'Test Passenger',
          familyName: 'Test',
          dateOfBirth: '1990-01-01',
          nationality: 'Test Country',
          identityNumber: '1234567890',
          issuingCountry: 'Test Country',
          category: 'Adult'
        }]
      };

      const response = await request(app)
        .post('/api/transaction/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('bookingCode');
      expect(response.body.data).toHaveProperty('midtransToken');
      
      testBookingCode = response.body.data.bookingCode;
    });

    it('should return 400 for invalid seat data', async () => {
      const payload = {
        seats: [99999], // Non-existent seat ID
        passengerDetails: [{
          title: 'Mr',
          name: 'Test Passenger',
          familyName: 'Test',
          dateOfBirth: '1990-01-01',
          nationality: 'Test Country',
          identityNumber: '1234567890',
          issuingCountry: 'Test Country',
          category: 'Adult'
        }]
      };

      const response = await request(app)
        .post('/api/transaction/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/transaction/status/:bookingCode', () => {
    it('should retrieve transaction status successfully', async () => {
      const response = await request(app)
        .get(`/api/transaction/status/${testBookingCode}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('bookingCode', testBookingCode);
    });

    it('should return 404 for non-existent booking code', async () => {
      const response = await request(app)
        .get('/api/transaction/status/NONEXIST123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/transaction/transactions', () => {
    it('should retrieve user transactions successfully', async () => {
      const response = await request(app)
        .get('/api/transaction/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const endDate = new Date();

      const response = await request(app)
        .get('/api/transaction/transactions')
        .query({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('POST /api/transaction/midtrans-callback', () => {
    it('should handle successful payment callback', async () => {
      const callbackData = {
        order_id: testBookingCode,
        transaction_status: 'settlement',
        fraud_status: 'accept',
        payment_type: 'credit_card'
      };

      const response = await request(app)
        .post('/api/transaction/midtrans-callback')
        .send(callbackData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should handle invalid callback data', async () => {
      const invalidCallbackData = {
        order_id: testBookingCode
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/transaction/midtrans-callback')
        .send(invalidCallbackData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/transaction/generate-pdf/:bookingCode', () => {
    beforeEach(async () => {
      // Update transaction status to 'Issued' for testing PDF generation
      await prisma.transaction.update({
        where: { bookingCode: testBookingCode },
        data: { status: 'Issued' }
      });
    });

    it('should generate PDF successfully', async () => {
      const response = await request(app)
        .get(`/api/transaction/generate-pdf/${testBookingCode}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('qrCode');
      expect(response.body.data).toHaveProperty('downloadUrl');
    });

    it('should return 404 for non-existent booking code', async () => {
      const response = await request(app)
        .get('/api/transaction/generate-pdf/NONEXIST123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/transaction/download/:bookingCode.pdf', () => {
    it('should download PDF successfully', async () => {
      const response = await request(app)
        .get(`/api/transaction/download/${testBookingCode}.pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/pdf');
    });

    it('should return 404 for non-existent PDF', async () => {
      const response = await request(app)
        .get('/api/transaction/download/NONEXIST123.pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});