import { Router, Request, Response } from "express";
import * as mongoose from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { Stay } from "../../shared/entities/stay";
import { StaySchema as Stays } from "../../shared/schemas";

export const StayRouter = Router();

// getAllStays
StayRouter.get("/", async (req: Request, res: Response): Promise<Response> => {
	try {
		let stays: Stay[] = await Stays.find().exec();
		return res.status(200).send(stays);
	} catch (e: any) {
		console.error(e);
		return res.status(500).send({ message: "An error occurred while retrieving all stays." });
	}
});


/*
StayRouter.get("/", async (req: Request, res: Response): Promise<Response> => {

});

StayRouter.post("/", async (req: Request, res: Response): Promise<Response> => {

});

StayRouter.get("/:stayId", async (req: Request, res: Response): Promise<Response> => {

});

StayRouter.put("/:stayId", async (req: Request, res: Response): Promise<Response> => {

});

StayRouter.patch("/:stayId", async (req: Request, res: Response): Promise<Response> => {

});

StayRouter.delete("/:stayId", async (req: Request, res: Response): Promise<Response> => {

});
*/