import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../route';

/**
 * GET /api/v1/tasks
 * 获取任务列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const priority = searchParams.get('priority');
    const overdue = searchParams.get('overdue'); // 是否只查过期任务

    const skip = (page - 1) * limit;

    const where: any = {
      isArchived: false,
    };

    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { in: ['PENDING', 'IN_PROGRESS'] };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      }),
      prisma.task.count({ where }),
    ]);

    return successResponse({
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return errorResponse('Failed to fetch tasks', 500);
  }
}

/**
 * POST /api/v1/tasks
 * 创建任务
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, dueDate, assignedTo, targetType, targetId } = body;

    if (!title || !assignedTo) {
      return errorResponse('Missing required fields: title, assignedTo', 400);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo,
        targetType,
        targetId,
        createdBy: 'system',
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse(task, 'Task created successfully');
  } catch (error) {
    console.error('Error creating task:', error);
    return errorResponse('Failed to create task', 500);
  }
}
