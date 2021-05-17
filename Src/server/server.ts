import path from "path";
import express from "express";
import mongoose from "mongoose";
//import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import chalk from "chalk";
//import { addRoutes } from "./routes";


//import { seedData } from "./utilities/data-seeder/seed-data";


import { OwnerRouter } from "./routes/owner.routes";
//import { SitterRouter } from "./routes/sitter.routes";
//import { StayRouter } from "./routes/stay.routes";


const openApiSpec = yaml.load(path.resolve(__dirname, "../api-definition.yaml"));

async function main() {
	console.log(chalk.black("Hello, friend."));

	console.log(`Environment detected: "${process.env.NODE_ENV}"`);

    /*
    // If a NODE_ENV wasn't defined, assume that we're running in a development environment.
    if (typeof process.env.NODE_ENV === "undefined" || process.env.NODE_ENV === null)
    {
        process.env.NODE_ENV = "development";
    }
    */

	// TODO: This is a bad approach. It would be better to define a retry policy.
	process.stdout.write("Pausing for 5 seconds to ensure MongoDB is started".padEnd(60, ".") + " ");
	await sleep(5 * 1000);
	console.log(chalk.green("done."));

	// Connect to MongoDB.
	process.stdout.write(`Connecting to MongoDB database \"${process.env.MONGO_INITDB_DATABASE}\"`.padEnd(60, ".") + " ");
	try {
		await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	}
	catch (error) {
		console.log("The following error occurred while attempting to connect to MongoDB:");
		console.log(error);
		process.exit(1);
	}
	console.log(chalk.green("done."));

	// Attempt to seed MongoDB with data.
	//await seedData();

	// Create our Express application.
	var app = express();
	//app.use(bodyParser.json());
	//app.use(bodyParser.json({ type: "application/vnd.api+json" }));
	//app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.json({ type: "application/vnd.api+json" }));
	app.use(express.urlencoded({ extended: true }));
	//app.use(express.static(__dirname + "/public"));
	//app.use(express.static("./public"));
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

	// Get the routes for our APIs that we defined in routes.js
	// TODO: We should replace this with an implementation of express-openapi and express-openapi-validator.
	
	//addRoutes(app);


	
	
	
	app.use("./routes/owners", OwnerRouter);
	//app.use("./routes/sitters", SitterRouter);
	//app.use("./routes/stay", StayRouter);







	process.stdout.write("Starting server".padEnd(60, ".") + " ");
	let server = app.listen(process.env.SERVER_PORT);
	console.log(chalk.green("done.") + ` Listening for requests on port ${process.env.SERVER_PORT}.`);

	// Export the server so we can use it for testing.
	module.exports = app;

	// Note: In the future, we could look into implementing something like godaddy/terminus for this.
	process.on("SIGTERM", async () => {
		console.log(chalk.yellow("Signal to terminate process received."));

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
