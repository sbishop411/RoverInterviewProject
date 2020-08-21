require("../models/Stay");
require("../models/Sitter");
var mongoose = require("mongoose");
var Stay = mongoose.model("Stay");
var Sitter = mongoose.model("Sitter");

// We need to get both a SitterId and a Stay model to make this work. Not sure how to enforce this.
exports.Add = function(request, response)
{
    // Create an Stay model based on the request that was sent in.
    var stay = new Stay(request.body.Stay);
    var sitterId = request.body.SitterId;

    if(!request.body.SitterId) return response.status(400).send({message: "A sitter Id must be provided when adding a stay."});

    // Attempt to save the new Stay to MongoDB
    stay.save(function(error, stay)
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
 
        // It's critical that we populate "Stays" before updating the sitter. This ensures that the OverallSitterRank is correctly calculated and saved.
        var sitterQuery = Sitter.findById(sitterId);
        sitterQuery.populate("Stays").exec(function(error, sitter)
        {
            // TODO: Should this really be a code 400? Presumably they sent along the wrong sitterId, but can we be sure of that?
            // If an error occurred, return a 400 response with the error message.
            if(error) return response.status(400).send({message: error});

            if(!sitter) return response.status(400).send({message: "The sitter associated with the provided SitterId could not be found."});

            sitter.Stays.push(stay);
            sitter.save(function(error)
            {
               // If an error occurred, return a 400 response with the error message.
                if(error) return response.status(400).send({message: error}); 

                // There were no errors, respond with code 200, a success message, and the created stay.
                response.status(200);
                response.statusMessage = "Stay successfully added.";

                // TODO: For some reason, this is resulting in the entire request being returned to the caller, instead of just the stay we created.
                response.json(stay);
            });
        });
    });
}

exports.GetAll = function(request, response)
{
    Stay.find()
        .exec(function(error, stays)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error) return response.status(400).send({message: error});

            response.json(stays);
        });
}

exports.GetSingle = function(request, response)
{
    response.json(request.stay);
};

exports.GetById = function(request, response, next, id)
{
    // Need to check that what we received is a valid identifier
    if(!mongoose.Types.ObjectId.isValid(id)) return response.status(400).send({message: "The supplied id \"" + id + "\" is not a valid mongoose id."});

    Stay.findById(id)
        .populate("Sitter")
        .exec(function(error, stay)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error) next(error);

            // If no matching stay was found, return a message indicating such.
            if(!stay)
            {
                return response.status(400).send({message: "No stay was found for ID \"" + id + "\"."});
            }
            
            request.stay = stay;
            next();
        });
}

exports.Update = function(request, response)
{
    // We've already retreived the document via the route parameter, so we can update it's values and save to the database.
    var stay = request.stay;

    // TODO: check out Object.assign(), which might be able to do this a little more cleanly.
    if(typeof request.body.Dogs != 'undefined' && request.body.Dogs !== null) stay.Dogs = request.body.Dogs;
    if(typeof request.body.StartDate != 'undefined' && request.body.StartDate !== null) stay.StartDate = request.body.StartDate;
    if(typeof request.body.EndDate != 'undefined' && request.body.EndDate !== null) stay.EndDate = request.body.EndDate;
    if(typeof request.body.ReviewText != 'undefined' && request.body.ReviewText !== null) stay.ReviewText = request.body.ReviewText;
    if(typeof request.body.Rating != 'undefined' && request.body.Rating !== null) stay.Rating = request.body.Rating;

    // Save the stay model that we've extracted from the request.
    stay.save(function(error)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) return response.status(400).send({message: error});

        response.json(stay);
    });
}

exports.Delete = function(request, response)
{
    // Create an Stay model based on the request that was sent in.
    var stay = request.stay;

    // Attempt to delete the stay from MongoDB
    stay.remove(function(error)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) return response.status(400).send({message: error});

        response.json(stay);
    });
}