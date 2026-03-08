import { GET, POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock the prisma client
jest.mock('@/lib/prisma');
const mockedPrisma = prisma as any;

describe('Contacts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/contacts', () => {
    it('should return a list of contacts', async () => {
      const mockContacts = [
        {
          id: '1',
          name: '张三',
          organization: 'ABC公司',
          email: 'zhangsan@example.com',
          tags: ['客户'],
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedPrisma.contact.findMany.mockResolvedValue(mockContacts);
      mockedPrisma.contact.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/v1/contacts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.contacts).toHaveLength(1);
      expect(data.data.contacts[0].name).toBe('张三');
      expect(mockedPrisma.contact.findMany).toHaveBeenCalled();
    });

    it('should filter contacts by search term', async () => {
      mockedPrisma.contact.findMany.mockResolvedValue([]);
      mockedPrisma.contact.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/v1/contacts?search=张三');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockedPrisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        })
      );
    });
  });

  describe('POST /api/v1/contacts', () => {
    it('should create a new contact', async () => {
      const newContact = {
        id: '2',
        name: '李四',
        organization: 'XYZ公司',
        phone: '13800138000',
        tags: ['潜在客户'],
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      };

      mockedPrisma.contact.create.mockResolvedValue(newContact);

      const mockRequestBody = {
        name: '李四',
        organization: 'XYZ公司',
        phone: '13800138000',
        tags: ['潜在客户'],
      };

      const request = new NextRequest('http://localhost:3000/api/v1/contacts', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('李四');
      expect(mockedPrisma.contact.create).toHaveBeenCalledWith({
        data: {
          ...mockRequestBody,
          createdBy: 'system',
        },
      });
    });

    it('should return 400 if name is missing', async () => {
      const mockRequestBody = {
        organization: 'XYZ公司',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/contacts', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Name is required');
    });
  });
});
