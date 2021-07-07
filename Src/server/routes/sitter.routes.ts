import { Router, Request, Response } from "express";
import * as mongoose from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { Sitter } from "../../shared/entities/sitter";
import { Stay } from "../../shared/entities/stay";
import { SitterModel as Sitters } from "../../shared/schemas";

export const SitterRouter = Router();


// getAllSitters
SitterRouter.get("/", async (req: Request, res: Response): Promise<Response> => {
	try {
		let sitters: Sitter[] = await Sitters.find()
			.populate({ path: "stays", model: Stay })
			.populate("sitterScore")
			.populate("ratingsScore")
			.populate("overallSitterRank")
			.exec();
		return res.status(200).send(sitters);
	} catch (e: any) {
		console.error(e);
		return res.status(500).send({ message: "An error occurred while retrieving all sitters." });
		//return res.status(500).send({ message: e.toString() });
	}
});

/*
SitterRouter.get("/", async (req: Request, res: Response): Promise<Response> => {

});

SitterRouter.post("/", async (req: Request, res: Response): Promise<Response> => {

});

SitterRouter.get("/:sitterId", async (req: Request, res: Response): Promise<Response> => {

});

SitterRouter.put("/:sitterId", async (req: Request, res: Response): Promise<Response> => {

});

SitterRouter.patch("/:sitterId", async (req: Request, res: Response): Promise<Response> => {

});

SitterRouter.delete("/:sitterId", async (req: Request, res: Response): Promise<Response> => {

});
*/