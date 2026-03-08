import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 认证中间件
 * TODO: 实现JWT验证逻辑
 */
export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // 开发环境跳过认证
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // 生产环境验证Bearer Token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      },
      { status: 401 }
    );
  }

  // TODO: 验证JWT token
  // const token = authHeader.substring(7);
  // const payload = verifyJWT(token);

  return NextResponse.next();
}

/**
 * 配置中间件在哪些路径上生效
 */
export const config = {
  matcher: [
    '/api/v1/:path*',
    // 排除公开端点
    '/((?!api/v1/public|_next/static|_next/image|favicon.ico).*)',
  ],
};
