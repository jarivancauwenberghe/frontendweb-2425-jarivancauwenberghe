import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import { ServiceError } from './serviceError';
import { User } from '../entity/user';
import { AppDataSource } from '../data/data-source';

/**
 * Middleware factory to authorize requests based on required role.
 * Tests:
 * - No auth header (expect 401).
 * - Invalid token (expect 401).
 * - Valid token but user not found (expect 404).
 * - Valid user but insufficient role (expect 403).
 * - Sufficient role (expect success).
 */
export const authorize = (requiredRole: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(ServiceError.unauthorized('Authorization token missing'));
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, config.get<string>('auth.jwt.secret')) as { id: number, role: string };

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: decoded.id });

            if (!user) {
                return next(ServiceError.notFound('User not found'));
            }

            if (user.userRoles.includes(requiredRole)) {
                (req as any).user = user;
                next();
            } else {
                return next(ServiceError.forbidden('Forbidden: You do not have the required permissions'));
            }
        } catch (error) {
            // Tests: Use a token signed with an incorrect secret or invalid payload to trigger this.
            return next(ServiceError.unauthorized('Invalid token'));
        }
    };
};
