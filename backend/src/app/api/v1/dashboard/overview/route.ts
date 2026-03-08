import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '../../route';

/**
 * GET /api/v1/dashboard/overview
 * 获取仪表盘概览数据
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ownerId = searchParams.get('ownerId');

    // 构建查询条件
    const ownerFilter = ownerId ? { ownerId } : {};

    // 并行查询各种统计数据
    const [
      totalContacts,
      totalNodes,
      opportunitiesByStatus,
      projectsByStage,
      upcomingTasks,
      recentActivities,
    ] = await Promise.all([
      prisma.contact.count({
        where: { isArchived: false },
      }),
      prisma.node.count({
        where: { isArchived: false },
      }),
      prisma.opportunity.groupBy({
        by: ['status'],
        where: { isArchived: false, ...ownerFilter },
        _count: true,
      }),
      prisma.project.groupBy({
        by: ['stage'],
        where: { isArchived: false, ...ownerFilter },
        _count: true,
      }),
      prisma.task.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          isArchived: false,
          dueDate: { gte: new Date() },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.interaction.findMany({
        where: { isArchived: false },
        orderBy: { occurredAt: 'desc' },
        take: 10,
        include: {
          opportunity: {
            select: { id: true, title: true },
          },
          project: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    // 统计需要关注的项目（7天未更新）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleProjects = await prisma.project.count({
      where: {
        isArchived: false,
        stage: { in: ['SCREENING', 'CONTACT', 'PROPOSAL', 'NEGOTIATION'] },
        updatedAt: { lt: sevenDaysAgo },
        ...ownerFilter,
      },
    });

    return successResponse({
      summary: {
        contacts: totalContacts,
        nodes: totalNodes,
        staleProjects,
      },
      opportunities: {
        total: opportunitiesByStatus.reduce((sum, item) => sum + item._count, 0),
        byStatus: opportunitiesByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
      },
      projects: {
        total: projectsByStage.reduce((sum, item) => sum + item._count, 0),
        byStage: projectsByStage.map((item) => ({
          stage: item.stage,
          count: item._count,
        })),
      },
      upcomingTasks,
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return errorResponse('Failed to fetch dashboard data', 500);
  }
}
