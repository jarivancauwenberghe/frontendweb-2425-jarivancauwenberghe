"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("config"));
const movieController_1 = require("../rest/movieController");
const reviewController_1 = require("../rest/reviewController");
const userController_1 = require("../rest/userController");
const data_source_1 = require("../data/data-source");
const errorMiddleware_1 = require("./errorMiddleware");
const logger_1 = __importDefault(require("./logger"));
const NODE_ENV = config_1.default.get('env');
const LOG_LEVEL = config_1.default.get('log.level');
const LOG_DISABLED = config_1.default.get('log.disabled');
const app = (0, express_1.default)();
exports.app = app;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use(errorMiddleware_1.errorMiddleware);
// Route definitions
app.get('/api/movies', movieController_1.MovieController.getMovies);
app.get('/api/movies/:id', movieController_1.MovieController.getMovieById);
app.post('/api/movies', movieController_1.MovieController.createMovie);
app.put('/api/movies/:id', movieController_1.MovieController.updateMovieById);
app.delete('/api/movies/:id', movieController_1.MovieController.deleteMovieById);
app.get('/api/reviews', reviewController_1.ReviewController.getReviews);
app.get('/api/reviews/:id', reviewController_1.ReviewController.getReviewById);
app.post('/api/reviews', reviewController_1.ReviewController.createReview);
app.put('/api/reviews/:id', reviewController_1.ReviewController.updateReviewById);
app.delete('/api/reviews/:id', reviewController_1.ReviewController.deleteReviewById);
app.get('/api/users', userController_1.UserController.getUsers);
app.get('/api/users/:id', userController_1.UserController.getUserById);
app.post('/api/users', userController_1.UserController.createUser);
app.put('/api/users/:id', userController_1.UserController.updateUserById);
app.delete('/api/users/:id', userController_1.UserController.deleteUserById);
const startServer = async () => {
    const port = process.env.PORT || config_1.default.get('port');
    if (!data_source_1.dataSource.isInitialized) {
        await (0, data_source_1.initializeDataSource)();
    }
    const server = app.listen(port, () => {
        logger_1.default.info(`🚀 Server listening on http://localhost:${port}`);
    });
    const shutdown = async () => {
        await data_source_1.dataSource.destroy();
        server.close(() => {
            logger_1.default.info('Server closed and database connection terminated');
        });
    };
    // Handle process termination signals to gracefully shut down the server and database connection
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    return server;
};
exports.startServer = startServer;
// Start the server if this file is run directly
if (require.main === module) {
    startServer().catch(error => {
        logger_1.default.error('Failed to start server', { error });
        process.exit(1);
    });
}
