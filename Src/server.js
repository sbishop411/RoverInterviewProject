const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const addRoutes = require("./server/routes");
const seedData = require("./server/utilities/data-seeder/seed-data");

async function main()
{
    // If a NODE_ENV wasn't defined, assume that we're running in a development environment.
    if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV === null)
    {
        process.env.NODE_ENV = "development";
    }

    // TODO: This is a bad approach. It would be better to define a retry policy.
    process.stdout.write("Pausing for 5 seconds to ensure MongoDB is started".padEnd(60, ".") + " ");
    await sleep(5 * 1000);
    console.log(chalk.green("done."));

    // Connect to MongoDB.
    process.stdout.write(`Connecting to MongoDB database \"${process.env.MONGO_INITDB_DATABASE}\"`.padEnd(60, ".") + " ");
    try
    {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }
    catch (error)
    {
        console.log("The following error occurred while attempting to connect to MongoDB:");
        console.log(error);
        process.exit(1);
    }
    console.log(chalk.green("done."));

    // Attempt to seed MongoDB with data.
    await seedData();

    // Create our Express application.
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(__dirname + "/public"));

    // Get the routes for our APIs that we defined in routes.js
    addRoutes(app);

    process.stdout.write("Starting server".padEnd(60, ".") + " ");
    app.listen(process.env.SERVER_PORT);
    console.log(chalk.green("done.") + ` Listening for requests on port ${process.env.SERVER_PORT}.`);

    // Export the server so we can use it for testing.
    module.exports = app;
}

function sleep(ms)
{
    return new Promise((resolve) =>
    {
        setTimeout(resolve, ms);
    });
}

main();