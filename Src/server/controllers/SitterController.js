const mongoose = require("mongoose");
const Sitter = require("../models/Sitter");
const Stay = require("../models/Stay");

exports.Add = function(request, response)
{
    // Create a Sitter model based on the request that was sent in.
    var sitter = new Sitter(request.body);

    if(sitter.Stays.length > 0)
    {
        return response.status(501).send({message: "Adding a new sitter with stays is not supported yet."});
    }

    // Attempt to save the new sitter to MongoDB
    sitter.save(function(error)
    {
        // TODO: flesh our out error reporting. We should be using the correct error codes and messages.
        // If an error occurred, return a response with the error message and appropriate error code.
        if(error)
        {
            if(error.name === "ValidationError")
            {
                return response.status(400).send({message: error});
            }
            else
            {
                return response.status(500).send({message: error});
            }
        }

        // There were no errors, respond with code 200, a success message, and the created sitter.
        response.status(200);
        response.statusMessage = "Sitter successfully added.";
        response.json(sitter);
    });
}

exports.GetAll = function(request, response)
{
    var searchQuery = Sitter.find();

    // If we were given a RatingsScore on the querystring, only return results that are equal or greater than it.
    if(typeof request.query.RatingsScore !== 'undefined' && request.query.RatingsScore !== null)
    {
        searchQuery.where("RatingsScore").gte(Number(request.query.RatingsScore));
    }
    
    searchQuery
        .populate("Stays", "Rating")
        .sort("-OverallSitterRank")
        .exec(function(error, sitters)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error) return response.status(400).send({message: error});

            response.json(sitters);
        });
}

exports.GetSingle = function(request, response)
{
    response.json(request.sitter);
};

exports.GetById = function(request, response, next, id)
{
    // Need to check that what we received is a valid identifier
    if(!mongoose.Types.ObjectId.isValid(id)) return response.status(400).send({message: "The supplied id \"" + id + "\" is not a valid mongoose id."});
    
    Sitter.findById(id)
        .populate("Stays")
        .exec(function(error, sitter)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error)
            {
                next(error);
            }

            // If no matching sitter was found, return a message indicating such.
            if(!sitter)
            {
                return response.status(400).send({message: "No sitter was found for ID \"" + id + "\"."});
            }
            
            request.sitter = sitter;
            next();
        });
}

exports.Update = function(request, response)
{
    // We've already retrieved the document via the route parameter, so we can update it's values and save to the database.
    var sitter = request.sitter;
    
    // TODO: check out Object.assign(), which might be able to do this a little more cleanly.
    if(typeof request.body.Name != 'undefined' && request.body.Name !== null) sitter.Name = request.body.Name;
    if(typeof request.body.Image != 'undefined' && request.body.Image !== null) sitter.Image = request.body.Image;
    if(typeof request.body.PhoneNumber != 'undefined' && request.body.PhoneNumber !== null) sitter.PhoneNumber = request.body.PhoneNumber;
    if(typeof request.body.EmailAddress != 'undefined' && request.body.EmailAddress !== null) sitter.EmailAddress = request.body.EmailAddress;
    if(typeof request.body.Stays != 'undefined' && request.body.Stays !== null) sitter.Stays = request.body.Stays;

    // Save the sitter model that we've extracted from the request.
    sitter.save(function(error)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) return response.status(400).send({message: error});

        response.json(sitter);
    });
}

exports.Delete = function(request, response)
{
    // Create a Sitter model based on the request that was sent in.
    var sitter = request.sitter;

    // Attempt to delete the sitter from MongoDB
    sitter.remove(function(error)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) return response.status(400).send({message: error});

        response.json(sitter);
    });
}
