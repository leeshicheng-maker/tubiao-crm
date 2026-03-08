import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../route';

/**
 * GET /api/v1/projects
 * 获取项目列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const stage = searchParams.get('stage');
    const ownerId = searchParams.get('ownerId');

    const skip = (page - 1) * limit;

    const where: any = {
      isArchived: false,
    };

    if (stage) {
      where.stage = stage;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
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
          opportunity: {
            select: { id: true, title: true, budgetRange, urgency },
          },
          interactions: {
            where: { isArchived: false },
            orderBy: { occurredAt: 'desc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return successResponse({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return errorResponse('Failed to fetch projects', 500);
  }
}

/**
 * POST /api/v1/projects
 * 创建项目
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      opportunityId,
      title,
      stage,
      sourceNodeId,
      ownerId,
      probability,
      estimatedRevenue,
      startDate,
      endDate,
      nextAction,
      nextActionDueAt,
    } = body;

    // 基本验证
    if (!ownerId) {
      return errorResponse('Missing required field: ownerId', 400);
    }

    // 如果提供了opportunityId，验证其存在
    if (opportunityId) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
      });

      if (!opportunity) {
        return errorResponse('Opportunity not found', 404);
      }
    }

    // 如果提供了sourceNodeId，验证其存在
    if (sourceNodeId) {
      const node = await prisma.node.findUnique({
        where: { id: sourceNodeId },
      });

      if (!node) {
        return errorResponse('Source node not found', 404);
      }
    }

    const project = await prisma.project.create({
      data: {
        opportunityId,
        title,
        stage: stage || 'SCREENING',
        sourceNodeId,
        ownerId,
        probability,
        estimatedRevenue,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        nextAction,
        nextActionDueAt: nextActionDueAt ? new Date(nextActionDueAt) : null,
        createdBy: 'system',
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        sourceNode: {
          select: { id: true, name: true, type: true },
        },
        opportunity: {
          select: { id: true, title: true, budgetRange, urgency },
        },
      },
    });

    return successResponse(project, 'Project created successfully', 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return errorResponse('Failed to create project', 500);
  }
}
