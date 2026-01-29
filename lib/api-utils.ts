import { NextResponse } from 'next/server';

/**
 * Standard API error types for ANTIGRAVITY.
 */
export enum ApiErrorType {
    VALIDATION = 'validation_error',
    AUTH = 'authentication_error',
    FORBIDDEN = 'forbidden',
    NOT_FOUND = 'not_found',
    RATE_LIMIT = 'rate_limit_exceeded',
    EXTERNAL_API = 'external_api_error',
    SERVER = 'internal_server_error',
}

/**
 * Standard success response helper.
 */
export function successResponse(data: any, status = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status }
    );
}

/**
 * Standard error response helper.
 */
export function errorResponse(type: ApiErrorType, message: string, details?: any, status = 500) {
    // Map error types to HTTP status codes if not provided
    const statusMap: Record<ApiErrorType, number> = {
        [ApiErrorType.VALIDATION]: 400,
        [ApiErrorType.AUTH]: 401,
        [ApiErrorType.FORBIDDEN]: 403,
        [ApiErrorType.NOT_FOUND]: 404,
        [ApiErrorType.RATE_LIMIT]: 429,
        [ApiErrorType.EXTERNAL_API]: 502,
        [ApiErrorType.SERVER]: 500,
    };

    const finalStatus = status === 500 ? statusMap[type] : status;

    return NextResponse.json(
        {
            success: false,
            error: {
                type,
                message,
                details,
            },
        },
        { status: finalStatus }
    );
}
