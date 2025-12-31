import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const client = new Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "http://localhost/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID || "";

async function listCollections() {
    try {
        console.log("Connecting to Appwrite...");
        console.log("Endpoint:", process.env.APPWRITE_ENDPOINT);
        console.log("Project ID:", process.env.APPWRITE_PROJECT_ID);
        console.log("Database ID:", databaseId);

        const result = await databases.listCollections(databaseId);

        let output = "--- Available Collections ---\n";
        result.collections.forEach(c => {
            output += `Name: "${c.name}" | ID: "${c.$id}"\n`;
        });
        output += "-----------------------------\n";

        fs.writeFileSync("debug_output.txt", output);
        console.log("Output written to debug_output.txt");

    } catch (error: any) {
        console.error("Error listing collections:", error.message);
    }
}

listCollections();
