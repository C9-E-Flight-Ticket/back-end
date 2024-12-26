// models/__mocks__/prismaClients.js
const prisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

module.exports = prisma;
