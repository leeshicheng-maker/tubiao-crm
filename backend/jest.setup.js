// Jest setup file
// 可以在这里配置测试环境，比如mock全局变量

// Mock Prisma so tests don't try to connect to a real database
jest.mock('@/lib/prisma', () => {
  const mockPrismaClient = {
    contact: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    opportunity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    prisma: mockPrismaClient,
  };
});
