var path = require("path");
var stays = require("./controllers/stay-controller");
var sitters = require("./controllers/sitter-controller");
var owners = require("./controllers/owner-controller");

module.exports = function(app)
{
    app.route("/api/owners")
        .get(owners.GetAll)
        .post(owners.Add);
    
    app.route("/api/owners/:ownerId")
        .get(owners.GetSingle)
        .put(owners.Update)
        .delete(owners.Delete);
    
    app.route("/api/sitters")
        .get(sitters.GetAll)
        .post(sitters.Add);
    
    app.route("/api/sitters/:sitterId")
        .get(sitters.GetSingle)
        .put(sitters.Update)
        .delete(sitters.Delete);

    app.route("/api/stays")
        .get(stays.GetAll)
        .post(stays.Add);
    
    app.route("/api/stays/:stayId")
        .get(stays.GetSingle)
        .put(stays.Update)
        .delete(stays.Delete);

    app.param("sitterId", sitters.GetById);
    app.param("ownerId", owners.GetById);
    app.param("stayId", stays.GetById);

    // The default route will serve up the index page for Angular.
    app.get("*", function(request, response)
    {
        // TODO: Determine if this is the right place for the base index page. Keep in mind that all routing defined here should be for the backend ONLY.
        response.sendFile(path.resolve(__dirname + "/../public/index.html"));
    });
};