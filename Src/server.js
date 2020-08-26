async function main()
{
    // If a NODE_ENV wasn't defined, assume that we're running in a development environment.
    if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV === null)
    {
        process.env.NODE_ENV = "development";
    }

    var express = require("express");
    var mongoose = require("mongoose");
    var bodyParser = require("body-parser");

    // Connect to MongoDB.
    console.log("Waiting for 5 seconds to ensure MongoDB is started...");
    await sleep(5 * 1000);

    try
    {
        mongoose.connect(process.env.MONGODB_CONNECTION_STRING, { useNewUrlParser: true });
    }
    catch (error)
    {
        console.log("The following error occurred while attempting to connect to MongoDB:");
        console.log(error);
        process.exit(1);
    }

    console.log("Successfully connected to database: " + process.env.MONGO_INITDB_DATABASE);

    // Create our Express application.
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
    app.use(bodyParser.urlencoded({ extended: true }));

    // Set the location that static files like images will be served from.
    app.use(express.static(__dirname + "/public"));

    // Get the routes for our APIs that we defined in routes.js
    require("./server/routes")(app);

    app.listen(process.env.SERVER_PORT);
    console.log("Rover Interview Project server now running at http://localhost:" + process.env.SERVER_PORT);

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