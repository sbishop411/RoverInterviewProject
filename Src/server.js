// If a NODE_ENV wasn't defined, assume that we're running in a development environment.
if(typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV === null)
{
    process.env.NODE_ENV = "development";
}

// TODO: This probably has to change when we move everything into a Src directory.
// Get the appropriate configuration file.
var config = require(__dirname + "/../config/config");

// Includes
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Create our Express application.
var app = express();

// Connect to MongoDB.
mongoose.connect(config.mongoDbUrl);
var dbArray = config.mongoDbUrl.split("/");
console.log("Connected to database: " + config.mongoDbUrl.split("/").slice(-1)[0]);

// Set up bodyParser
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true })); 

// Set the location that static files like images will be served from.
app.use(express.static(__dirname + "/public"));

// Get the routes for our APIs that we defined in routes.js
require("./server/routes")(app);

// Start listening for requests.
app.listen(config.port);

// Log that the server is now up and running.
console.log("Rover Interview Project server now running at http://localhost:" + config.port);

// Export the server so we can use it for testing.
module.exports = app;