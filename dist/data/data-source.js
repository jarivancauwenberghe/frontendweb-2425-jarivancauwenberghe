"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDataSource = exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
const movie_1 = require("../entity/movie");
const review_1 = require("../entity/review");
const user_1 = require("../entity/user");
require("dotenv/config");
const config_1 = __importDefault(require("config"));
// Haal de NODE_ENV op uit de configuratie
const NODE_ENV = config_1.default.get("env");
// Bepaal of de huidige omgeving development of test is
const isDevelopmentOrTest = NODE_ENV === "development" || NODE_ENV === "test";
// Haal de database configuratie op uit de configuratiebestanden
const dbConfig = config_1.default.get('database');
// Configureer de data source opties
const dataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || dbConfig.host,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : dbConfig.port,
    username: process.env.DB_USERNAME || dbConfig.username,
    password: process.env.DB_PASSWORD || dbConfig.password,
    database: process.env.DB_NAME || dbConfig.name,
    synchronize: isDevelopmentOrTest,
    migrationsRun: !isDevelopmentOrTest,
    entities: [movie_1.Movie, review_1.Review, user_1.User],
    migrations: ['src/migration/**/*.ts'],
    extra: {
        connectionLimit: 10,
        connectTimeout: 10000
    }
};
// Maak de data source aan
exports.dataSource = new typeorm_1.DataSource(dataSourceOptions);
// Functie om de data source te initialiseren
const initializeDataSource = async () => {
    await exports.dataSource.initialize();
    console.log('Data Source has been initialized!');
    if (!isDevelopmentOrTest) {
        await exports.dataSource.runMigrations();
        console.log('Migrations have been run in production!');
    }
};
exports.initializeDataSource = initializeDataSource;
