import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/contacts/:id
 * 获取单个联系人详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!contact) {
      return errorResponse('Contact not found', 404);
    }

    if (contact.isArchived) {
      return errorResponse('Contact has been archived', 404);
    }

    return successResponse(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return errorResponse('Failed to fetch contact', 500);
  }
}

/**
 * PATCH /api/v1/contacts/:id
 * 更新联系人
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 检查联系人是否存在
    const existingContact = await prisma.contact.findUnique({
      where: { id: params.id },
    });

    if (!existingContact) {
      return errorResponse('Contact not found', 404);
    }

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
        updatedBy: 'system', // TODO: 从JWT中获取
      },
    });

    return successResponse(contact, 'Contact updated successfully');
  } catch (error) {
    console.error('Error updating contact:', error);
    return errorResponse('Failed to update contact', 500);
  }
}

/**
 * DELETE /api/v1/contacts/:id
 * 软删除联系人（归档）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contact.update({
      where: { id: params.id },
      data: {
        isArchived: true,
        updatedAt: new Date(),
      },
    });

    return successResponse(null, 'Contact archived successfully');
  } catch (error) {
    console.error('Error archiving contact:', error);
    return errorResponse('Failed to archive contact', 500);
  }
}
