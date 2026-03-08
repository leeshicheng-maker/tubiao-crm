import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../route';

/**
 * GET /api/v1/contacts
 * 获取联系人列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = {
      isArchived: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { organization: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    return successResponse({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return errorResponse('Failed to fetch contacts', 500);
  }
}

/**
 * POST /api/v1/contacts
 * 创建联系人
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, organization, phone, email, wechat, tags, notes } = body;

    // 基本验证
    if (!name) {
      return errorResponse('Name is required', 400);
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        title,
        organization,
        phone,
        email,
        wechat,
        tags: tags || [],
        notes,
        createdBy: 'system', // TODO: 从JWT中获取
      },
    });

    return successResponse(contact, 'Contact created successfully', 201);
  } catch (error) {
    console.error('Error creating contact:', error);
    return errorResponse('Failed to create contact', 500);
  }
}
