"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class Authentication {
    static async generateToken(user) {
        const { id, username, userRoles } = user;
        return jsonwebtoken_1.default.sign({ id, username, userRoles }, Authentication.secret, { expiresIn: Authentication.expiresIn });
    }
    static async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt_1.default.hash(password, saltRounds);
    }
    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
    static async authorize(ctx, requiredRole, entityId) {
        const authHeader = ctx.header.authorization;
        if (!authHeader) {
            ctx.status = 401;
            ctx.body = { error: 'Authorization token missing' };
            return false;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, Authentication.secret);
            const { id, userRoles } = decoded;
            if (userRoles.includes('admin'))
                return true;
            if (entityId && userRoles.includes('user') && id === entityId)
                return true;
            if (entityId && (!userRoles.includes('user') || id !== entityId)) {
                ctx.status = 403;
                ctx.body = { error: 'Insufficient permissions' };
                return false;
            }
            if (!entityId && !userRoles.includes('user')) {
                ctx.status = 403;
                ctx.body = { error: 'Insufficient permissions' };
                return false;
            }
            return true;
        }
        catch (error) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid authorization token' };
            return false;
        }
    }
}
exports.Authentication = Authentication;
Authentication.secret = process.env.AUTH_JWT_SECRET || 'fallback-secret-key';
Authentication.expiresIn = process.env.JWT_EXPIRES_IN || '1h';
