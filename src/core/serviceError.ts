export class ServiceError extends Error {
    public statusCode: number;
    public errors?: any;

    constructor(message: string, statusCode: number, errors?: any) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        // Captures stack trace for debugging
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ServiceError);
        }
    }

    // Static helpers for common HTTP statuses
    static notFound(message: string = 'Not Found'): ServiceError {
        return new ServiceError(message, 404);
    }

    static badRequest(message: string = 'Bad Request'): ServiceError {
        return new ServiceError(message, 400);
    }

    static unauthorized(message: string = 'Unauthorized'): ServiceError {
        return new ServiceError(message, 401);
    }

    static forbidden(message: string = 'Forbidden'): ServiceError {
        return new ServiceError(message, 403);
    }
}

/**
 * Tests for ServiceError:
 * - Create a ServiceError with different status codes and ensure the correct code and message are set.
 * - Check that errors property is passed correctly.
 * - Use static helpers (notFound, badRequest, etc.) and verify the returned objects have correct status and message.
 */
