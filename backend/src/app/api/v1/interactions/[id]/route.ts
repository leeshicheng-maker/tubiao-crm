import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/interactions/:id
 * 获取跟进记录详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const interaction = await prisma.interaction.findUnique({
      where: { id },
    });

    if (!interaction) {
      return errorResponse('Interaction not found', 404);
    }

    return successResponse(interaction);
  } catch (error) {
    console.error('Error fetching interaction:', error);
    return errorResponse('Failed to fetch interaction', 500);
  }
}

/**
 * PATCH /api/v1/interactions/:id
 * 更新跟进记录
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 检查跟进记录是否存在
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id },
    });

    if (!existingInteraction) {
      return errorResponse('Interaction not found', 404);
    }

    // 更新跟进记录
    const interaction = await prisma.interaction.update({
      where: { id },
      data: {
        ...(body.type && { type: body.type }),
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(body.occurredAt && { occurredAt: new Date(body.occurredAt) }),
        ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
        updatedBy: 'system',
      },
    });

    return successResponse(interaction, 'Interaction updated successfully');
  } catch (error) {
    console.error('Error updating interaction:', error);
    return errorResponse('Failed to update interaction', 500);
  }
}

/**
 * DELETE /api/v1/interactions/:id
 * 软删除跟进记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 检查跟进记录是否存在
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id },
    });

    if (!existingInteraction) {
      return errorResponse('Interaction not found', 404);
    }

    // 软删除
    await prisma.interaction.update({
      where: { id },
      data: {
        isArchived: true,
        updatedBy: 'system',
      },
    });

    return successResponse(null, 'Interaction deleted successfully');
  } catch (error) {
    console.error('Error deleting interaction:', error);
    return errorResponse('Failed to delete interaction', 500);
  }
}
