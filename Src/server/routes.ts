/*
import { Application, Request, Response } from "express";
import path from "path";
import * as stays from "./controllers/stay.controller";
import * as sitters from "./controllers/sitter.controller";
import * as owners from "./controllers/owner.controller";

export function addRoutes(app: Application)
{
    app.route("/api/owners")
        .get(owners.getAllOwners)
        .post(owners.addOwner);
    
    app.route("/api/owners/:ownerId")
        .get(owners.getSingleOwner)
        .put(owners.replaceOwner)
        .patch(owners.updateOwner)
        .delete(owners.deleteOwner);
    
    app.route("/api/sitters")
        .get(sitters.getAllSitters)
        .post(sitters.addSitter);
    
    app.route("/api/sitters/:sitterId")
        .get(sitters.getSingleSitter)
        .put(sitters.replaceSitter)
        .patch(sitters.updateSitter)
        .delete(sitters.deleteSitter);

    app.route("/api/stays")
        .get(stays.getAllStays)
        .post(stays.addStay);
    
    app.route("/api/stays/:stayId")
        .get(stays.getSingleStay)
        .put(stays.replaceStay)
        .patch(stays.updateStay)
        .delete(stays.deleteStay);

    app.param("ownerId", owners.getOwnerById);
    app.param("sitterId", sitters.getSitterById);
    app.param("stayId", stays.getStayById);

    // The default route will serves up the index page for the web client.
    app.get("*", function(request: Request, response: Response)
    {
        // TODO: Determine if this is the right place for the base index page. Keep in mind that all routing defined here should be for the backend ONLY.
        //response.sendFile(path.resolve(__dirname + "/../client/index.html"));
		response.render(path.resolve(__dirname + "/../client/index.html"), { title: "Rover Interview Project" });
    });
};
*/