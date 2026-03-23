import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';
import { TaskServiceError } from '@/services/tasks-service';

export function logApi(route: string, message: string, metadata?: Record<string, unknown>) {
  console.info(`[tasks-api] ${route} ${message}`, metadata ?? {});
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data, error: null }, init);
}

export function fail(message: string, status = 400, code = 'BAD_REQUEST', details?: unknown) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      data: null,
      error: { code, message, details },
    },
    { status },
  );
}

export function fromServiceError(error: unknown, route: string) {
  if (error instanceof TaskServiceError) {
    logApi(route, 'service_error', { code: error.code, message: error.message, details: error.details });
    return fail(error.message, error.statusCode, error.code, error.details);
  }

  logApi(route, 'unknown_error', { error: error instanceof Error ? error.message : String(error) });
  return fail(error instanceof Error ? error.message : '服务器内部错误', 500, 'INTERNAL_SERVER_ERROR');
}
