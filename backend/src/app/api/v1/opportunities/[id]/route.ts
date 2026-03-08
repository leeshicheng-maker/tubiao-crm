import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/opportunities/:id
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        sourceNode: { select: { id: true, name: true, type: true, industry: true } },
        project: { select: { id: true, stage: true, probability: true } },
        interactions: {
          where: { isArchived: false },
          orderBy: { occurredAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!opportunity || opportunity.isArchived) {
      return errorResponse('Opportunity not found', 404);
    }

    return successResponse(opportunity);
  } catch (error) {
    return errorResponse('Failed to fetch opportunity', 500);
  }
}

/**
 * PATCH /api/v1/opportunities/:id
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, industry, budgetRange, urgency, status, ownerId, notes } = body;

    const existing = await prisma.opportunity.findUnique({ where: { id: params.id } });
    if (!existing || existing.isArchived) {
      return errorResponse('Opportunity not found', 404);
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(industry !== undefined && { industry }),
        ...(budgetRange !== undefined && { budgetRange }),
        ...(urgency && { urgency }),
        ...(status && { status }),
        ...(ownerId && { ownerId }),
        ...(notes !== undefined && { notes }),
        updatedBy: 'system',
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        sourceNode: { select: { id: true, name: true, type: true } },
      },
    });

    return successResponse(opportunity, 'Opportunity updated successfully');
  } catch (error) {
    return errorResponse('Failed to update opportunity', 500);
  }
}

/**
 * POST /api/v1/opportunities/:id/convert-project
 * 机会转项目
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // 路由判断：只处理 convert-project
  const url = new URL(request.url);
  if (!url.pathname.endsWith('/convert-project')) {
    return errorResponse('Not found', 404);
  }

  try {
    const body = await request.json();
    const { probability, estimatedRevenue, nextAction, nextActionDueAt } = body;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    });

    if (!opportunity || opportunity.isArchived) {
      return errorResponse('Opportunity not found', 404);
    }

    if (opportunity.status === 'CONVERTED') {
      return errorResponse('Opportunity already converted to project', 400);
    }

    // 事务：创建项目 + 更新机会状态
    const [project] = await prisma.$transaction([
      prisma.project.create({
        data: {
          opportunityId: params.id,
          title: opportunity.title,
          stage: 'SCREENING',
          sourceNodeId: opportunity.sourceNodeId,
          ownerId: opportunity.ownerId,
          probability,
          estimatedRevenue,
          nextAction,
          nextActionDueAt: nextActionDueAt ? new Date(nextActionDueAt) : undefined,
          createdBy: 'system',
        },
      }),
      prisma.opportunity.update({
        where: { id: params.id },
        data: { status: 'CONVERTED', updatedBy: 'system' },
      }),
    ]);

    return successResponse(project, 'Opportunity converted to project successfully');
  } catch (error) {
    console.error('Error converting opportunity:', error);
    return errorResponse('Failed to convert opportunity', 500);
  }
}
