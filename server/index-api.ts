import { type Server } from "node:http";
import express, { type Express } from "express";
import runApp, { app } from "./app";

export async function serveApi(app: Express, _server: Server) {
    // This is a standalone API server, so we don't need to serve static files
    // or setup Vite middleware here.
    console.log("Starting standalone API server...");
}

(async () => {
    await runApp(serveApi);
})();
