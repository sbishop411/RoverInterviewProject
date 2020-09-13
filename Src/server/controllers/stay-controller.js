const mongoose = require("mongoose");
const StaySchema = require("../schemas/stay-schema");

exports.getAllStays = async function (request, response)
{
    // TODO: Returning this entire populated data set for 500 records is about 460 MB over the wire. Not great. We should implement pagination or a count limit.
    try
    {
        var stays = await StaySchema
            .find()
            .exec();

        response.status(200).json(stays);
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while retrieving all stays." });
    }
}

exports.addStay = async function (request, response)
{
    // TODO: Implement field value validation.
    try
    {
        let stay = await StaySchema.create(request.body);

        response.status(201).json(stay);
    }
    catch (error)
    {
        // TODO: Figure out if validation will fail if we provide a non-existent ID for an Owner or Sitter.
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied stay is invalid and cannot be created." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while adding the specified stay." });
        }
    }
}

exports.getStayById = async function (request, response, next, id)
{
    // Note: This is what gets run when the router needs to populate a stay from a stay ID before passing it to an endpoint.
    if (!mongoose.Types.ObjectId.isValid(id)) return response.status(400).send({ message: `The supplied id "${id}" is not valid.` });

    try
    {
        let stay = await StaySchema.findById(id)
            .populate("Owner")
            .populate("Sitter")
            .exec();

        if (!stay)
        {
            response.status(404).send({ message: "A stay with the specified ID was not found." });
        }
        else
        {
            request.stay = stay;
            next();
        }
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while retrieving the specified stay." });
    }
}

exports.getSingleStay = function (request, response)
{
    try
    {
        response.status(200).json(request.stay);
    }
    catch (error)
    {
        console.error(error);
        return response.status(500).send({ message: "An error occurred while retrieving the specified stay." });
    }
};

exports.replaceStay = async function (request, response)
{
    try
    {
        request.stay.Owner = request.body.Owner;
        request.stay.Sitter = request.body.Sitter;
        request.stay.Dogs = request.body.Dogs;
        request.stay.StartDate = request.body.StartDate;
        request.stay.EndDate = request.body.EndDate;
        request.stay.ReviewText = request.body.ReviewText;
        request.stay.Rating = request.body.Rating;
        let stay = await request.stay.save();

        response.status(200).json(stay);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied stay is invalid, and cannot be used to replace the stay." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while attempting to replace the stay." });
        }
    }
}

exports.updateStay = async function (request, response)
{
    try
    {
        request.stay = Object.assign(request.stay, request.body);
        let stay = await request.stay.save();

        response.status(200).json(stay);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied stay data is invalid, so the stay cannot be updated." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while attempting to update the stay." });
        }
    }
}

exports.deleteStay = async function (request, response)
{
    try
    {
        await request.stay.delete();

        response.status(204).send({ message: "Stay successfully deleted." });
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while attempting to delete the stay." });
    }
}
