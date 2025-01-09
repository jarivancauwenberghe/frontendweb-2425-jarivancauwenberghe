# Examenopdracht Web Services

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/snPWRHYg)

- **Student:** JARI VANCAUWENBERGHE
- **Studentennummer:** 221003505575
- **E-mailadres:** <mailto:jari.vancauwenberghe@student.hogent.be>

## Vereisten

Voor deze opdracht zijn de volgende softwarevereisten nodig:

- [NodeJS](https://nodejs.org): Node.js is de runtime-omgeving die gebruikt wordt om de applicatie te draaien.
- [npm](https://www.npmjs.com/): Node Package Manager voor het beheren van de dependencies.
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/): MySQL wordt gebruikt als relationele database voor het project.
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/): MySQL Workbench is een GUI-tool om de MySQL-database te beheren.
- [tsx](https://www.npmjs.com/package/tsx): Een snellere TypeScript-executor voor Node.js.

## Opstarten

1. Maak een `.env` bestand aan in de root van je project met de volgende inhoud (vervang placeholders met eigen waarden):

    ```plaintext
    NODE_ENV=development
    PORT=9000
    DB_HOST=<jouw-database-host>
    DB_USER=<jouw-database-gebruiker>
    DB_PASSWORD=<jouw-database-wachtwoord>
    DB_NAME=<jouw-database-naam>
    JWT_SECRET=<jouw-jwt-secret>
    ```

2. Installeer de benodigde dependencies met npm:

    ```bash
    npm install
    ```

3. Build de applicatie voor productie:

    ```bash
    npm run build
    ```

4. Start de applicatie met `tsx` om de TypeScript-code direct uit te voeren:

    ```bash
    npx tsx src/core/index.ts
    ```

## Testen

1. Maak een `.env.test` bestand aan in de root van je project met de volgende inhoud (vervang placeholders met eigen waarden):

    ```plaintext
    NODE_ENV=test
    PORT=9001
    DB_HOST=<jouw-test-database-host>
    DB_PORT=<jouw-test-database-poort>
    DB_NAME=<jouw-test-database-naam>
    DB_USERNAME=<jouw-test-database-gebruiker>
    DB_PASSWORD=<jouw-test-database-wachtwoord>
    AUTH_JWT_SECRET=<jouw-jwt-test-secret>
    ```

2. Voer de volgende commando uit om de testen te draaien:

    ```bash
    npm run test
    ```
