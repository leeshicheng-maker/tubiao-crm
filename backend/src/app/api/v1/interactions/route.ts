import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../route';

/**
 * GET /api/v1/interactions
 * 获取跟进记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    const where: any = {
      isArchived: false,
    };

    if (targetType) {
      where.targetType = targetType;
    }

    if (targetId) {
      where.targetId = targetId;
    }

    if (type) {
      where.type = type;
    }

    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { occurredAt: 'desc' },
      }),
      prisma.interaction.count({ where }),
    ]);

    return successResponse({
      interactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return errorResponse('Failed to fetch interactions', 500);
  }
}

/**
 * POST /api/v1/interactions
 * 创建跟进记录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      content,
      targetType,
      targetId,
      userId,
      occurredAt,
    } = body;

    // 基本验证
    if (!type || !title || !content || !targetType || !targetId || !userId) {
      return errorResponse('Missing required fields: type, title, content, targetType, targetId, userId', 400);
    }

    // 验证type是否合法
    const validTypes = ['CALL', 'MEETING', 'MESSAGE', 'EMAIL', 'NOTE'];
    if (!validTypes.includes(type)) {
      return errorResponse(`Invalid type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    // 验证targetType是否合法
    const validTargetTypes = ['OPPORTUNITY', 'PROJECT'];
    if (!validTargetTypes.includes(targetType)) {
      return errorResponse(`Invalid targetType. Must be one of: ${validTargetTypes.join(', ')}`, 400);
    }

    // 验证关联对象是否存在
    if (targetType === 'OPPORTUNITY') {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: targetId },
      });

      if (!opportunity) {
        return errorResponse('Opportunity not found', 404);
      }
    } else if (targetType === 'PROJECT') {
      const project = await prisma.project.findUnique({
        where: { id: targetId },
      });

      if (!project) {
        return errorResponse('Project not found', 404);
      }
    }

    const interaction = await prisma.interaction.create({
      data: {
        type,
        title,
        content,
        targetType,
        targetId,
        userId,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        createdBy: 'system',
      },
    });

    return successResponse(interaction, 'Interaction created successfully', 201);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return errorResponse('Failed to create interaction', 500);
  }
}
