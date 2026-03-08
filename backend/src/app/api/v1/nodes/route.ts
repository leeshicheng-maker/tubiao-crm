import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../route';

/**
 * GET /api/v1/nodes
 * 获取超级节点列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const industry = searchParams.get('industry');

    const skip = (page - 1) * limit;

    const where: any = {
      isArchived: false,
    };

    if (type) {
      where.type = type;
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    const [nodes, total] = await Promise.all([
      prisma.node.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          contact: {
            select: { id: true, name: true, phone: true, email: true },
          },
          _count: {
            select: {
              opportunities: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.node.count({ where }),
    ]);

    return successResponse({
      nodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return errorResponse('Failed to fetch nodes', 500);
  }
}

/**
 * POST /api/v1/nodes
 * 创建超级节点
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      industry,
      location,
      level,
      strength,
      resources,
      contactId,
      ownerId,
    } = body;

    // 基本验证
    if (!name || !type || !ownerId) {
      return errorResponse('Missing required fields: name, type, ownerId', 400);
    }

    // 验证type是否合法
    if (
!['INDIVIDUAL', 'ORGANIZATION'].includes(type)
) {
      return errorResponse('Invalid type. Must be INDIVIDUAL or ORGANIZATION', 400);
    }

    // 如果提供了contactId，验证其存在
    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
      });

      if (!contact) {
        return errorResponse('Contact not found', 404);
      }
    }

    const node = await prisma.node.create({
      data: {
        name,
        type,
        industry,
        location,
        level,
        strength,
        resources: resources || [],
        contactId,
        ownerId,
        createdBy: 'system',
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        contact: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return successResponse(node, 'Node created successfully', 201);
  } catch (error) {
    console.error('Error creating node:', error);
    return errorResponse('Failed to create node', 500);
  }
}
