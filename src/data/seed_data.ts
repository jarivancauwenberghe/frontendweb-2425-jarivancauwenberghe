import { generateMockData } from './mock_data';

/**
 * seedDatabase():
 * - Used for seeding the DB with mock data.
 * Tests:
 * - Possibly call this in test setup for integration tests.
 * - Ensure errors bubble up properly.
 */
export async function seedDatabase() {
    try {
        await generateMockData();
        console.log('Database successfully seeded.');
    } catch (err) {
        console.error('Seeding failed:', err);
        throw err;
    }
}
