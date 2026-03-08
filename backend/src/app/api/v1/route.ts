import { NextResponse } from 'next/server';

/**
 * 统一的成功响应格式
 */
export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || 'Success',
    },
    { status: 200 }
  );
}

/**
 * 统一的错误响应格式
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: code || getErrorCode(statusCode),
        message,
      },
    },
    { status: statusCode }
  );
}

/**
 * 根据HTTP状态码返回对应的错误码
 */
function getErrorCode(statusCode: number): string {
  const errorMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    500: 'INTERNAL_SERVER_ERROR',
  };
  return errorMap[statusCode] || 'UNKNOWN_ERROR';
}

/**
 * 验证错误响应（通常用于Zod验证失败）
 */
export function validationErrorResponse(errors: Array<{ path: string; message: string }>) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
    },
    { status: 422 }
  );
}
