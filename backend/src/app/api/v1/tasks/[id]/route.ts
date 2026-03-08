import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/tasks/:id
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task || task.isArchived) {
      return errorResponse('Task not found', 404);
    }

    return successResponse(task);
  } catch (error) {
    return errorResponse('Failed to fetch task', 500);
  }
}

/**
 * PATCH /api/v1/tasks/:id
 * 更新任务（包括标记完成）
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, description, priority, status, dueDate, assignedTo } = body;

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing || existing.isArchived) {
      return errorResponse('Task not found', 404);
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedTo && { assignedTo }),
        updatedBy: 'system',
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(task, 'Task updated successfully');
  } catch (error) {
    return errorResponse('Failed to update task', 500);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * 软删除（归档）
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.task.update({
      where: { id: params.id },
      data: { isArchived: true, updatedBy: 'system' },
    });
    return successResponse(null, 'Task archived successfully');
  } catch (error) {
    return errorResponse('Failed to archive task', 500);
  }
}
