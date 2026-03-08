import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/projects/:id
 * 获取项目详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        sourceNode: {
          select: { id: true, name: true, type: true, industry: true, location: true },
        },
        opportunity: {
          select: { id: true, title: true, industry: true, budgetRange, urgency, status },
          include: {
            sourceNode: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        interactions: {
          where: { isArchived: false },
          orderBy: { occurredAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return successResponse(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return errorResponse('Failed to fetch project', 500);
  }
}

/**
 * PATCH /api/v1/projects/:id
 * 更新项目
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 检查项目是否存在
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return errorResponse('Project not found', 404);
    }

    // 更新项目
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.stage && { stage: body.stage }),
        ...(body.probability !== undefined && { probability: body.probability }),
        ...(body.estimatedRevenue && { estimatedRevenue: body.estimatedRevenue }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.nextAction !== undefined && { nextAction: body.nextAction }),
        ...(body.nextActionDueAt && { nextActionDueAt: new Date(body.nextActionDueAt) }),
        ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
        updatedBy: 'system',
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

    return successResponse(project, 'Project updated successfully');
  } catch (error) {
    console.error('Error updating project:', error);
    return errorResponse('Failed to update project', 500);
  }
}

/**
 * DELETE /api/v1/projects/:id
 * 软删除项目
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 检查项目是否存在
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return errorResponse('Project not found', 404);
    }

    // 软删除
    await prisma.project.update({
      where: { id },
      data: {
        isArchived: true,
        updatedBy: 'system',
      },
    });

    return successResponse(null, 'Project deleted successfully');
  } catch (error) {
    console.error('Error deleting project:', error);
    return errorResponse('Failed to delete project', 500);
  }
}
