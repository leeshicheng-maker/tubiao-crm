import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../route';

/**
 * GET /api/v1/opportunities
 * 获取机会列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');

    const skip = (page - 1) * limit;

    const where: any = {
      isArchived: false,
    };

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          sourceNode: {
            select: { id: true, name: true, type: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return successResponse({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return errorResponse('Failed to fetch opportunities', 500);
  }
}

/**
 * POST /api/v1/opportunities
 * 创建机会
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      sourceNodeId,
      industry,
      budgetRange,
      urgency,
      ownerId,
      notes,
    } = body;

    // 基本验证
    if (!title || !sourceNodeId || !ownerId) {
      return errorResponse('Missing required fields: title, sourceNodeId, ownerId', 400);
    }

    // 验证sourceNode是否存在
    const sourceNode = await prisma.node.findUnique({
      where: { id: sourceNodeId },
    });

    if (!sourceNode) {
      return errorResponse('Source node not found', 404);
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        sourceNodeId,
        industry,
        budgetRange,
        urgency: urgency || 'MEDIUM',
        ownerId,
        notes,
        createdBy: 'system',
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        sourceNode: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return successResponse(opportunity, 'Opportunity created successfully', 201);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return errorResponse('Failed to create opportunity', 500);
  }
}
