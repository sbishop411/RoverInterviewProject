var path = require("path");
var stays = require("./controllers/stay-controller");
var sitters = require("./controllers/sitter-controller");
var owners = require("./controllers/owner-controller");

module.exports = function(app)
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

    // The default route will serve up the index page for Angular.
    app.get("*", function(request, response)
    {
        // TODO: Determine if this is the right place for the base index page. Keep in mind that all routing defined here should be for the backend ONLY.
        response.sendFile(path.resolve(__dirname + "/../public/index.html"));
    });
};