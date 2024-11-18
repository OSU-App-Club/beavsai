import { REST, Routes } from "discord.js";
import { Client, GatewayIntentBits } from "discord.js";

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN) {
  console.error("TOKEN is required.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("CLIENT_ID is required.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: "10" }).setToken(TOKEN);

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
];

try {
  console.log("Started refreshing application (/) commands.");

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(TOKEN);
