"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_1 = require("../entity/user");
const data_source_1 = require("../data/data-source");
const serviceError_1 = require("../core/serviceError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRepository = data_source_1.dataSource.getRepository(user_1.User);
class UserService {
    static async getAllUsers() {
        return userRepository.find();
    }
    static async getUserById(id) {
        const user = await userRepository.findOneBy({ id: parseInt(id) });
        if (!user) {
            throw serviceError_1.ServiceError.notFound('User not found');
        }
        return user;
    }
    static async createUser(userData) {
        if (!userData.username || !userData.password) {
            throw serviceError_1.ServiceError.validationFailed('Username and password are required');
        }
        userData.password = await bcrypt_1.default.hash(userData.password, 10);
        const user = userRepository.create(userData);
        return userRepository.save(user);
    }
    static async updateUserById(id, userData) {
        const user = await this.getUserById(id);
        if (!user) {
            throw serviceError_1.ServiceError.notFound('User not found');
        }
        if (userData.password) {
            userData.password = await bcrypt_1.default.hash(userData.password, 10);
        }
        Object.assign(user, userData);
        return userRepository.save(user);
    }
    static async deleteUserById(id) {
        const user = await this.getUserById(id);
        if (!user) {
            throw serviceError_1.ServiceError.notFound('User not found');
        }
        await userRepository.remove(user);
        return true;
    }
}
exports.UserService = UserService;
