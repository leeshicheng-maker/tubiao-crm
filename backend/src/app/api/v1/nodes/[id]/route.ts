import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/nodes/:id
 * 获取节点详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        contact: {
          select: { id: true, name: true, phone: true, email: true, wechat: true, organization: true },
        },
        opportunities: {
          where: { isArchived: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            owner: {
              select: { id: true, name: true },
            },
          },
        },
        projects: {
          where: { isArchived: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            owner: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!node) {
      return errorResponse('Node not found', 404);
    }

    return successResponse(node);
  } catch (error) {
    console.error('Error fetching node:', error);
    return errorResponse('Failed to fetch node', 500);
  }
}

/**
 * PATCH /api/v1/nodes/:id
 * 更新节点
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 检查节点是否存在
    const existingNode = await prisma.node.findUnique({
      where: { id },
    });

    if (!existingNode) {
      return errorResponse('Node not found', 404);
    }

    // 如果要更新contactId，验证其存在
    if (body.contactId && body.contactId !== existingNode.contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: body.contactId },
      });

      if (!contact) {
        return errorResponse('Contact not found', 404);
      }
    }

    // 更新节点
    const node = await prisma.node.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.type && { type: body.type }),
        ...(body.industry && { industry: body.industry }),
        ...(body.location && { location: body.location }),
        ...(body.level && { level: body.level }),
        ...(body.strength && { strength: body.strength }),
        ...(body.resources && { resources: body.resources }),
        ...(body.contactId !== undefined && { contactId: body.contactId }),
        ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
        updatedBy: 'system',
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

    return successResponse(node, 'Node updated successfully');
  } catch (error) {
    console.error('Error updating node:', error);
    return errorResponse('Failed to update node', 500);
  }
}

/**
 * DELETE /api/v1/nodes/:id
 * 软删除节点
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 检查节点是否存在
    const existingNode = await prisma.node.findUnique({
      where: { id },
    });

    if (!existingNode) {
      return errorResponse('Node not found', 404);
    }

    // 软删除
    await prisma.node.update({
      where: { id },
      data: {
        isArchived: true,
        updatedBy: 'system',
      },
    });

    return successResponse(null, 'Node deleted successfully');
  } catch (error) {
    console.error('Error deleting node:', error);
    return errorResponse('Failed to delete node', 500);
  }
}
