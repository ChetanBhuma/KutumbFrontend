/**
 * Error handling utilities for consistent error management across the application
 */

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 409, 'CONFLICT_ERROR', details);
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_ERROR');
        this.name = 'RateLimitError';
    }
}

export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        statusCode: number;
        details?: unknown;
        stack?: string;
    };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
    if (error instanceof AppError) {
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                details: error.details,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
        };
    }

    if (error instanceof Error) {
        return {
            success: false,
            error: {
                message: error.message,
                statusCode: 500,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
        };
    }

    return {
        success: false,
        error: {
            message: 'An unexpected error occurred',
            statusCode: 500,
        },
    };
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }

    return 'An unexpected error occurred';
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, type: string): boolean {
    return error instanceof Error && error.name === type;
}

/**
 * Log error to console (development) or logging service (production)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
    const errorMessage = getErrorMessage(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', errorMessage);
        if (errorStack) {
            console.error('Stack:', errorStack);
        }
        if (context) {
            console.error('Context:', context);
        }
    } else {
        // TODO: Send to logging service (e.g., Sentry, LogRocket)
        // logToService({ error, context });
    }
}

/**
 * Handle async errors with retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        delay?: number;
        shouldRetry?: (error: unknown) => boolean;
    } = {}
): Promise<T> {
    const { maxRetries = 3, delay = 1000, shouldRetry = () => true } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries || !shouldRetry(error)) {
                throw error;
            }

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
    }

    throw lastError;
}

/**
 * Safe async wrapper that catches errors
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    fallback?: T
): Promise<{ data: T | null; error: unknown }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (error) {
        logError(error);
        return { data: fallback ?? null, error };
    }
}

/**
 * Validate and sanitize input
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential XSS characters
        .substring(0, 10000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Validate Aadhaar number
 */
export function isValidAadhaar(aadhaar: string): boolean {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s+/g, ''));
}

/**
 * Validate date is not in future
 */
export function isValidPastDate(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj <= new Date();
}

/**
 * Validate file upload
 */
export function validateFile(
    file: File,
    options: {
        maxSize?: number; // in bytes
        allowedTypes?: string[];
    } = {}
): { valid: boolean; error?: string } {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options;

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size must be less than ${maxSize / 1024 / 1024}MB`,
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type must be one of: ${allowedTypes.join(', ')}`,
        };
    }

    return { valid: true };
}
