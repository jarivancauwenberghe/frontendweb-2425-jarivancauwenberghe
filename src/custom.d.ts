import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        roles: string[];
      } & JwtPayload; 
      // Tests & Notes:
      // - Verify that user object is properly set after token verification in integration tests.
      // - Consider testing route handlers that rely on req.user properties.
    }
  }
}

/**
 * No code changes needed, just ensure tests cover routes that rely on req.user.
 * If needed, add more fields and test their presence in req.user.
 */
