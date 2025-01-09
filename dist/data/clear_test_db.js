"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const review_1 = require("../entity/review");
const movie_1 = require("../entity/movie");
const user_1 = require("../entity/user");
const clearDatabase = async () => {
    await data_source_1.dataSource.initialize();
    // Verwijder eerst de recensies
    await data_source_1.dataSource.getRepository(review_1.Review).delete({});
    console.log('Reviews verwijderd.');
    // Verwijder vervolgens de films
    await data_source_1.dataSource.getRepository(movie_1.Movie).delete({});
    console.log('Movies verwijderd.');
    // Verwijder tenslotte de gebruikers
    await data_source_1.dataSource.getRepository(user_1.User).delete({});
    console.log('Users verwijderd.');
    await data_source_1.dataSource.destroy();
    console.log('Data Source verbinding gesloten.');
};
clearDatabase().catch((err) => {
    console.error('Fout bij het schoonmaken van de database:', err);
    process.exit(1);
});
