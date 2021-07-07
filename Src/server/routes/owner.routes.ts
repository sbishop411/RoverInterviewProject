import { Router, Request, Response } from "express";
import * as mongoose from "mongoose";
import { Owner } from "../../shared/entities/owner";
import { OwnerModel as Owners } from "../../shared/schemas";

export const OwnerRouter = Router();

// getAllOwners
OwnerRouter.get("/", async (req: Request, res: Response): Promise<Response> => {
	try {
		let owners: Owner[] = await Owners.find().exec();
		return res.status(200).send(owners);
	} catch (e: any) {
		console.error(e);
		return res.status(500).send({ message: "An error occurred while retrieving all owners." });
	}
});

// addOwner
OwnerRouter.post("/", async (req: Request, res: Response): Promise<Response> => {
	try {
		let owner: Owner = await Owners.create(req.body);
		return res.status(201).json(owner);
	} catch (e: any) {
		if (e.name === "ValidationError")
        {
            return res.status(400).send({ message: "The supplied owner is invalid and cannot be created." });
        }
        else
        {
            console.error(e);
            return res.status(500).send({ message: "An error occurred while adding the specified owner." });
        }
	}
});

// getSingleOwner
OwnerRouter.get("/:ownerId", async (req: Request, res: Response): Promise<Response> => {
	// TODO: Can we abstract this into a function?
	if (!mongoose.isValidObjectId(req.params.ownerId)) return res.status(400).send({ message: `The supplied id "${req.params.ownerId}" is not valid.` });

	try {
		let owner: Owner = await Owners.findById(new mongoose.Types.ObjectId(req.params.ownerId))
			.populate("Stays")
            .exec() as Owner;

		if (!owner) {
			return res.status(404).send({ message: "An owner with the specified ID was not found." });
		} else {
			return res.status(200).send(owner);
		}
	} catch (e: any) {
		console.error(e);
		return res.status(500).send(e.message);
	}
});

// replaceOwner
OwnerRouter.put("/:ownerId", async (req: Request, res: Response): Promise<Response> => {
    // TODO: Can we abstract this into a function?
	if (!mongoose.isValidObjectId(req.params.ownerId)) return res.status(400).send({ message: `The supplied id "${req.params.ownerId}" is not valid.` });
	
	try
    {
		let owner: Owner = await Owners.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.ownerId), req.body, { "new": true, "overwrite": true })
			.populate("Stays")
			.exec() as Owner;  // TODO: May not need this line?

        return res.status(200).json(owner);
    }
    catch (e: any)
    {
        if (e.name === "ValidationError")
        {
            return res.status(400).send({ message: "The supplied owner is invalid, and cannot be used to replace the owner." });
        }
        else
        {
            console.error(e);
            return res.status(500).send({ message: "An error occurred while attempting to replace the owner." });
        }
    }
});

// updateOwner
OwnerRouter.patch("/:ownerId", async (req: Request, res: Response): Promise<Response> => {
	// TODO: Can we abstract this into a function?
	if (!mongoose.isValidObjectId(req.params.ownerId)) return res.status(400).send({ message: `The supplied id "${req.params.ownerId}" is not valid.` });

    try
    {
		let owner: Owner = await Owners.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.ownerId), req.body, { "new": true, "overwrite": false })
			.populate("Stays")
			.exec() as Owner;  // TODO: May not need this line?

        return res.status(200).json(owner);
    }
    catch (e: any)
    {
        if (e.name === "ValidationError")
        {
            return res.status(400).send({ message: "The supplied owner data is invalid, so the owner cannot be updated." });
        }
        else
        {
            console.error(e);
            return res.status(500).send({ message: "An error occurred while attempting to update the owner." });
        }
    }
});

// deleteOwner
OwnerRouter.delete("/:ownerId", async (req: Request, res: Response): Promise<Response> => {
	// TODO: Can we abstract this into a function?
	if (!mongoose.isValidObjectId(req.params.ownerId)) return res.status(400).send({ message: `The supplied id "${req.params.ownerId}" is not valid.` });

    try
    {
        await Owners.findByIdAndDelete(new mongoose.Types.ObjectId(req.params.ownerId));
        return res.status(204).send({ message: "Owner successfully deleted." });
    }
    catch (e: any)
    {
        console.error(e);
        return res.status(500).send({ message: "An error occurred while attempting to delete the owner." });
    }
});












/*
// ./api-v1/paths/worlds.js
export default function(ownerController) {
	let operations = {
	  GET
	};
  
	function GET(request: Request, response: Response, next: any) {
	  response.status(200).json(ownerController.getWorlds(request.query.worldName));
	}
  
	// NOTE: We could also use a YAML string here.
	GET.apiDoc = {
	  summary: 'Returns worlds by name.',
	  operationId: 'getWorlds',
	  parameters: [
		{
		  in: 'query',
		  name: 'worldName',
		  required: true,
		  type: 'string'
		}
	  ],
	  responses: {
		200: {
		  description: 'A list of worlds that match the requested name.',
		  schema: {
			type: 'array',
			items: {
			  $ref: '#/definitions/World'
			}
		  }
		},
		default: {
		  description: 'An error occurred',
		  schema: {
			additionalProperties: true
		  }
		}
	  }
	};
  
	return operations;
}
*/