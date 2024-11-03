## Beavs AI

Beavs AI is an application that provides an AI Chatbot that is knowledgeable about OSU's courses. It allows OSU students to interact with an AI agent that can answer course-specific questions.

## Project Prerequisites

- Node: You should install the latest version of [Node](https://nodejs.org/en)
- Docker: The download link is [here](https://www.docker.com/), make sure to choose the correct operating system.

## Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/OSU-App-Club/beavsai.git
   ```
2. Navigate to the project directory:

   ```bash
   cd beavsai
   ```

3. Install all the required dependencies to run our Next.js App
   ```bash
   npm install
   ```

> [!NOTE]
> You may come across an peer dependency error when running this command, try `npm install --legacy-peer-deps`

4. Copy the `.env.example` file to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

5. Message [@nyumat](https://discord.com/users/700444827287945316) on Discord to get the required credentials for the `.env.local` file.

> [!WARNING]
> Do not share these credentials with anyone else. Additionally, you will not be able to run the application without them.

6. Create an AUTH_SECRET environment variable

   ```bash
   npx auth secret
   ```

7. Start a local instance of our PostgreSQL database using [Docker](https://www.docker.com/):

   ```bash
   docker-compose up -d
   ```

> [!NOTE]
> Doing this in VSCode's terminal may present you with an error like:
> Error: P1010: User `postgres` was denied access on the database `postgres`.
> To fix this, use your system's terminal to run the command.

8. Run the Next.js App
   ```bash
   npm run dev
   ```

## Scripts

<!-- Yeah this is messy, but please don't modify it! (since it works) If you do, paper-trail on Discord. Thanks! -->

| Script         | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `dev`          | Runs database generation, migration, and starts the Next.js dev server with Turbopack enabled. |
| `build`        | Builds the Next.js application for production.                                                 |
| `start`        | Starts the Next.js application in production mode.                                             |
| `lint`         | Runs ESLint to check for code quality issues.                                                  |
| `format`       | Formats the codebase with Prettier.                                                            |
| `check-format` | Checks code formatting without making changes.                                                 |
| `type-check`   | Runs TypeScript type checks based on the configuration in `tsconfig.json`.                     |
| `db:generate`  | Generates Prisma client based on schema and `.env.local` configuration.                        |
| `db:migrate`   | Applies migrations for development using `.env.local` configuration.                           |
| `db:studio`    | Opens Prisma Studio for database management.                                                   |

## Troubleshooting

If you encounter any issues while running the application, please refer to the following troubleshooting steps:

1. **Database Connection Issues**: If you are unable to connect to the database, ensure that the Docker container is running. You can check the status of the container by running the following command:

   ```bash
   docker ps
   ```

   If the container is not running, you can start it using the following command:

   ```bash
   docker-compose up -d
   ```

2. **Environment Variables**: Ensure that you have copied the `.env.example` file to `.env.local` and have filled in the required credentials. If you are missing any credentials, please message [@nyumat](https://discord.com/users/700444827287945316) on Discord.

3. **Prisma Client Generation**: If you are encountering issues with the Prisma client, you can regenerate it by running the following command:

   ```bash
   npm run db:generate
   ```

## Contributors

<a href="https://github.com/osu-app-club/beavsai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=osu-app-club/beavsai" />
</a>
