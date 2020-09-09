const mongoose = require("mongoose");
const OwnerSchema = require("../schemas/owner-schema");

exports.Add = function(request, response)
{
    // Create an Owner model based on the request that was sent in.
    var owner = new OwnerSchema(request.body);

    // Attempt to save the new Owner to MongoDB
    owner.save(function(error)
    {
        // TODO: Flesh our out error reporting. We should be using the correct error codes and messages.
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
        
        // There were no errors, respond with code 200, a success message, and the created owner.
        response.status(200);
        response.statusMessage = "Owner successfully added.";
        response.json(owner);
    });
}

exports.GetAll = function(request, response)
{
    OwnerSchema.find()
        .exec(function(error, owners)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error) return response.status(400).send({message: error});

            response.json(owners);
        });
}

exports.GetSingle = function(request, response)
{
    response.json(request.owner);
};

exports.GetById = function(request, response, next, id)
{
    // Need to check that what we received is a valid identifier
    if(!mongoose.Types.ObjectId.isValid(id)) return response.status(400).send({message: "The supplied id \"" + id + "\" is not a valid mongoose id."});
    
    OwnerSchema.findById(id)
        .populate("Stays")
        .exec(function(error, owner)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error)
            {
                next(error);
            }

            // If no matching owner was found, return a message indicating such.
            if(!owner)
            {
                return response.status(400).send({message: "No owner was found for ID \"" + id + "\"."});
            }
            
            request.owner = owner;
            next();
        });
}

exports.Update = function(request, response)
{
    // We've already retrieved the document via the route parameter, so we can update it's values and save to the database.
    var owner = request.owner;
    
    // TODO: check out Object.assign(), which might be able to do this a little more cleanly.
    if(typeof request.body.Name != 'undefined' && request.body.Name !== null) owner.Name = request.body.Name;
    if(typeof request.body.Image != 'undefined' && request.body.Image !== null) owner.Image = request.body.Image;
    if(typeof request.body.PhoneNumber != 'undefined' && request.body.PhoneNumber !== null) owner.PhoneNumber = request.body.PhoneNumber;
    if(typeof request.body.EmailAddress != 'undefined' && request.body.EmailAddress !== null) owner.EmailAddress = request.body.EmailAddress;

    // Save the sitter model that we've extracted from the request.
    owner.save(function(error)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) return response.status(400).send({message: error});

        response.json(owner);
    });
}

exports.Delete = function(request, response)
{
    // Create an Owner model based on the request that was sent in.
    var owner = request.owner;

    // Attempt to delete the owner from MongoDB
    owner.remove(function(error)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) return response.status(400).send({message: error});
        
        response.json(owner);
    });
}
