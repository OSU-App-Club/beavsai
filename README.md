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
   cd ./beavsai
   ```

3. Install all the required dependencies to run our Next.js App
   ```bash
   npm install
   ```

> [!NOTE]
> You may come across an peer dependency error when running this command, try `npm install --legacy-peer-deps`

4. Create an `.env.local` file in the root directory of the project and add the following environment variables:

   ```bash
    DATABASE_URL="postgresql://prisma_user:prisma_password@localhost:5432/prisma_db"
    AUTH_GOOGLE_ID=
    AUTH_GOOGLE_SECRET=
   ```

5. Message [@nyumat](https://discord.com/users/700444827287945316) on Discord to get the OAuth credentials for the application.

> [!WARNING]
> Do not share these credentials with anyone else. You will not be able to run the application without them.

6. Create an AUTH_SECRET environment variable

   ```bash
   npx auth secret
   ```

7. Start a local PostgreSQL database using Docker

   ```bash
   docker compose up -d
   ```

8. Run the Next.js App
   ```bash
   npm run dev
   ```

<div align="start">
  <h2>Contributors</h2>
  <table>
    <tbody>
      <tr>
        <td align="center">
          <a href="https://github.com/Nyumat">
            <img src="https://images.weserv.nl/?url=github.com/Nyumat.png&fit=cover&mask=circle" width="80"><br>
            Tom Nyuma
          </a>
        </td>
        <!-- TEMPLATE BELOW (uncomment to include) -->
        <!-- <td align="center">
          <a href="https://github.com/[username]">
            <img src="https://images.weserv.nl/?url=github.com/[username].png&fit=cover&mask=circle" width="80"><br>
            [Full Name]
            </a>
        </td> -->
       <td align="center">
          <a href="https://github.com/muhammadakbar7">
            <img src="https://images.weserv.nl/?url=github.com/muhammadakbar7.png&fit=cover&mask=circle" width="80"><br>
            Muhammad Akbar
            </a>
      </tr>
    </tbody>
  </table>
</div>
