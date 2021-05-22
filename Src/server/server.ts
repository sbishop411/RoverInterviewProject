import path from "path";
import express from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import chalk from "chalk";
import dotenv from "dotenv";
import { OwnerRouter } from "./routes/owner.routes";
import { SitterRouter } from "./routes/sitter.routes";
import { StayRouter } from "./routes/stay.routes";
import { seedData } from "./util/data-seeder/seed-data";

const openApiSpec = yaml.load(path.resolve(__dirname, "../api-definition.yaml"));

async function main() {
	console.log(chalk.black("Hello, friend."));

	// Before we do anything else, let dotenv load the environment variables.
	process.stdout.write(`Looking for .env in: ${path.resolve("./.env")}`.padEnd(60, ".") + " ");
	dotenv.config({ path: path.resolve("./.env") });

    // If a NODE_ENV wasn't defined, assume that we're running in a development environment.
    if (typeof process.env.NODE_ENV === "undefined" || process.env.NODE_ENV === null) {
        process.env.NODE_ENV = "production";
		console.log(chalk.green("done.") + ` No environment detected, defaulting to '${process.env.NODE_ENV}'.`);
    } else {
		console.log(chalk.green("done.") + ` Environment detected: "${process.env.NODE_ENV}".`);
	}

	// TODO: This is a bad approach. It would be better to define a retry policy.
	process.stdout.write("Pausing for 5 seconds to ensure MongoDB is started".padEnd(60, ".") + " ");
	await sleep(5 * 1000);
	console.log(chalk.green("done."));

	// Connect to MongoDB.
	process.stdout.write(`Connecting to MongoDB database \"${process.env.MONGO_INITDB_DATABASE}\"`.padEnd(60, ".") + " ");
	try {
		await mongoose.connect(process.env.MONGODB_CONNECTION_STRING!, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

	} catch (error) {
		console.log(`The following error occurred while attempting to connect to MongoDB with connection string \"${process.env.MONGODB_CONNECTION_STRING}\":`);
		console.log(error);
		process.exit(1);
	}
	console.log(chalk.green("done."));

	await seedData();

	// Create our Express application.
	var app = express();
	app.use(express.json({ type: "application/vnd.api+json" }));
	app.use(express.urlencoded({ extended: true }));
	// TODO: Determine if a static directory like this is still necessary. I think it will be.
	//app.use(express.static(__dirname + "/public"));
	
	// Add routes
	// TODO: We should replace this with an implementation of express-openapi and express-openapi-validator.
	app.use("/api/owners", OwnerRouter);
	app.use("/api/sitters", SitterRouter);
	app.use("/api/stays", StayRouter);
	app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
	app.get("*", function(req: express.Request, res: express.Response) { // The default route will serves up the index page for the web client.
		res.render(path.resolve(__dirname + "/../client/index.html"), { title: "Rover Interview Project" });
	});

	process.stdout.write("Starting server".padEnd(60, ".") + " ");
	let server = app.listen(process.env.SERVER_PORT);
	console.log(chalk.green("done.") + ` Listening for requests on port ${process.env.SERVER_PORT}.`);

	// Export the server so we can use it for testing.
	module.exports = app;

	// Note: In the future, we could look into implementing something like godaddy/terminus for this.
	process.on("SIGTERM", async () => {
		console.log(chalk.yellow("Shutdown signal received."));

		process.stdout.write("Shutting down the HTTP server".padEnd(60, ".") + " ");
		await server.close();
		console.log(chalk.green("done."));

		process.stdout.write("Closing connection to MongoDB".padEnd(60, ".") + " ");
		await mongoose.connection.close(false);
		console.log(chalk.green("done."));

		console.log(chalk.black("Goodbye, friend."));
		process.exit(0);
	});
}

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

main();
