const mongoose = require("mongoose");
const SitterSchema = require("../schemas/sitter-schema");

exports.GetAll = async function (request, response)
{
    try
    {
        var sitters = await SitterSchema
            .find()
            // TODO: See if this line is necessary.
            .populate("Stays", "Rating")
            .sort("-OverallSitterRank")
            .exec();

        response.status(200).json(sitters);
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while retrieving all sitters." });
    }
}

exports.Add = async function (request, response)
{
    // TODO: Implement field value validation.
    try
    {
        let sitter = await SitterSchema.create(request.body);

        response.status(201).json(sitter);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied sitter is invalid and cannot be created." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while adding the specified sitter." });
        }
    }
}

exports.GetById = async function (request, response, next, id)
{
    // Note: This is what gets run when the router needs to populate a sitter from a sitter ID before passing it to an endpoint.
    if (!mongoose.Types.ObjectId.isValid(id)) return response.status(400).send({ message: `The supplied id "${id}" is not valid.` });

    try
    {
        let sitter = await SitterSchema.findById(id)
            .populate("Stays")
            .exec();

        if (!sitter)
        {
            response.status(404).send({ message: "The requested sitter does not exist." });
        }
        else
        {
            request.sitter = sitter;
            next();
        }
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while retrieving the specified sitter." });
    }
}

exports.GetSingle = function (request, response)
{
    try
    {
        response.status(200).json(request.sitter);
    }
    catch (error)
    {
        console.error(error);
        return response.status(500).send({ message: "An error occurred while retrieving the specified sitter." });
    }
};

exports.Replace = async function (request, response)
{
    try
    {
        // Note: findOneAndReplace() would be the most accurate method to use here, but it triggers a query middleware instead of a document middleware, which means 
        // that it would be a lot harder implement the auto-update logic for the calculated Sitter fields. That said, there's gotta be a better way to do a replace.
        request.sitter.Name = request.body.Name;
        request.sitter.PhoneNumber = request.body.PhoneNumber;
        request.sitter.EmailAddress = request.body.EmailAddress;
        request.sitter.Image = request.body.Image;
        let sitter = await request.sitter.save();
        
        response.status(200).json(sitter);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied sitter is invalid, and cannot be used to replace the sitter." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while attempting to replace the sitter." });
        }
    }
}

exports.Update = async function (request, response)
{
    try
    {
        request.sitter = Object.assign(request.sitter, request.body);
        let sitter = await request.sitter.save();

        response.status(200).json(sitter);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied sitter data is invalid, so the sitter cannot be updated." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while attempting to update the sitter." });
        }
    }
}

exports.Delete = async function (request, response)
{
    try
    {
        await request.sitter.delete();

        response.status(204).send({ message: "Sitter successfully deleted." });
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while attempting to delete the sitter." });
    }
}
