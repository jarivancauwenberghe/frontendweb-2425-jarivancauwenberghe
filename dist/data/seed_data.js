"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const mock_data_1 = require("./mock_data");
async function seedDatabase() {
    await (0, data_source_1.initializeDataSource)();
    await (0, mock_data_1.generateMockData)();
    console.log('Database successfully seeded.');
    await data_source_1.dataSource.destroy();
}
exports.default = seedDatabase;
seedDatabase().catch(err => {
    console.error('Seeding failed:', err);
});
