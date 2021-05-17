/*
import { Types } from "mongoose";
import { Request, Response } from "express";
import { OwnerSchema as Owners } from "../../shared/classes/owner";

export async function getAllOwners(request: Request, response: Response)
{
    try
    {
        var owners = await Owners.find().exec();

        response.status(200).json(owners);
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while retrieving all owners." });
    }
}

export async function addOwner(request: Request, response: Response)
{
    // TODO: Implement field value validation.
	try
    {
        let owner = await Owners.create(request.body);

        response.status(201).json(owner);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied owner is invalid and cannot be created." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while adding the specified owner." });
        }
    }
}

export async function getOwnerFromRequest(request: Request)
{

}


export async function getOwnerById(request, response, next, id)
{
    // Note: This is what gets run when the router needs to populate an owner from an owner ID before passing it to an endpoint.
    if (!Types.ObjectId.isValid(id)) return response.status(400).send({ message: `The supplied id "${id}" is not valid.` });

    try
    {
		let owner = await Owners.findById(id)
            .populate("Stays")
            .exec();

        if (!owner)
        {
            response.status(404).send({ message: "An owner with the specified ID was not found." });
        }
        else
        {
            request.owner = owner;
            next();
        }
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while retrieving the specified owner." });
    }
}

export function getSingleOwner(request, response)
{
    try
    {
        response.status(200).json(request.owner);
    }
    catch (error)
    {
        console.error(error);
        return response.status(500).send({ message: "An error occurred while retrieving the specified owner." });
    }
};

export async function replaceOwner(request, response)
{
    try
    {
        let owner = await Owners.findOneAndReplace({ _id: request.owner._id }, request.body, { "new": true });

        response.status(200).json(owner);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied owner is invalid, and cannot be used to replace the owner." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while attempting to replace the owner." });
        }
    }
}

export async function updateOwner(request, response)
{
    try
    {
        request.owner = Object.assign(request.owner, request.body);
        let owner = await request.owner.save();
  
        response.status(200).json(owner);
    }
    catch (error)
    {
        if (error.name === "ValidationError")
        {
            response.status(400).send({ message: "The supplied owner data is invalid, so the owner cannot be updated." });
        }
        else
        {
            console.error(error);
            response.status(500).send({ message: "An error occurred while attempting to update the owner." });
        }
    }
}

export async function deleteOwner(request, response)
{
    try
    {
        await request.owner.delete();

        response.status(204).send({ message: "Owner successfully deleted." });
    }
    catch (error)
    {
        console.error(error);
        response.status(500).send({ message: "An error occurred while attempting to delete the owner." });
    }
}
*/