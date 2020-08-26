// Mongoose and schema includes.
var config = require(__dirname + "/../../config/config");

console.log("Connection URL: " + config.mongoDbUrl);

let testMongoose = require("mongoose");
testMongoose.connect(config.mongoDbUrl);

require(__dirname + "/../../Src/server/models/Owner");
//let Owner = testMongoose.model("Owner");

// Get Chai set up.
let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);

// This is the main webserver.
let server = require(__dirname + "/../../Src/server");

// Parent block for Owners
describe("Owners", function ()
{
    // The default of 2 seconds probably isn't enough, so bump it up to 10.
    this.timeout(10 * 1000);

    before(function (done)
    {
        //testMongoose.connect(config.mongoDbUrl);
        var Owner = testMongoose.model("Owner");
        done();
    });

    // Empty out the Owner collection before every test. This will help keep our testing environment clean and our dependencies in check.
    beforeEach(function (done)
    {
        //let Owner = testMongoose.model("Owner");

        Owner.remove({}, function (error)
        {
            done();
        });
    });

    after(function (done)
    {
        return testMongoose.disconnect(done);
    });

    //===================================================================================================================
    // Create Owner tests (POST to /api/owners)
    //===================================================================================================================
    describe("/POST owner", function ()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a valid owner
        //-------------------------------------------------------------------------------------------------------------------
        it("it should POST a valid owner", function (done)
        {
            var validOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888",
                EmailAddress: "sb411@gmail.com"
            });

            chai.request(server)
                .post("/api/owners")
                .send(validOwner)
                .end(function (error, response)
                {
                    response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("Name").eql("Scott B.");
                    response.body.should.have.property("Image").eql("http://avatars0.githubusercontent.com/u/13400555?s=460&v=4");
                    response.body.should.have.property("PhoneNumber").eql("88888888888");
                    response.body.should.have.property("EmailAddress").eql("sb411@gmail.com");

                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create an owner without a Name
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST an owner without Name field", function (done)
        {
            var noNameOwner = new Owner({
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888",
                EmailAddress: "sb411@gmail.com"
            });

            chai.request(server)
                .post("/api/owners")
                .send(noNameOwner)
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.message.should.have.property("name").eql("ValidationError");
                    response.body.message.should.have.property("errors");
                    response.body.message.errors.should.have.property("Name");
                    response.body.message.errors.Name.should.have.property("kind").eql("required");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create an owner without a PhoneNumber
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST an owner without PhoneNumber field", function (done)
        {
            var noPhoneNumberOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                EmailAddress: "sb411@gmail.com"
            });

            chai.request(server)
                .post("/api/owners")
                .send(noPhoneNumberOwner)
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.message.should.have.property("name").eql("ValidationError");
                    response.body.message.should.have.property("errors");
                    response.body.message.errors.should.have.property("PhoneNumber");
                    response.body.message.errors.PhoneNumber.should.have.property("kind").eql("required");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create an owner without a EmailAddress
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST an owner without EmailAddress field", function (done)
        {
            var noEmailAddressOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888"
            });

            chai.request(server)
                .post("/api/owners")
                .send(noEmailAddressOwner)
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.message.should.have.property("name").eql("ValidationError");
                    response.body.message.should.have.property("errors");
                    response.body.message.errors.should.have.property("EmailAddress");
                    response.body.message.errors.EmailAddress.should.have.property("kind").eql("required");
                    done();
                });
        });
    });

    //===================================================================================================================
    // Get all Owners tests (GET to /api/owners)
    //===================================================================================================================
    describe("/GET all owners", function ()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all owners (none)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET no owners when the collection is empty", function (done)
        {
            chai.request(server)
                .get("/api/owners")
                .end(function (error, response)
                {
                    response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("array");
                    response.body.length.should.be.eql(0);
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all owners (one)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET one result when one owner exists", async function ()
        {
            return new Promise(async function (resolve)
            {
                var singleOwner = new Owner({
                    Name: "Andy A.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                    PhoneNumber: "11111111111",
                    EmailAddress: "aardvark@gmail.com"
                });

                await Owner.create(singleOwner);

                chai.request(server)
                    .get("/api/owners")
                    .end(function (error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("array");
                        response.body.length.should.be.eql(1);

                        response.body.forEach(function (owner)
                        {
                            owner.should.have.property("Name");
                            owner.should.have.property("Image");
                            owner.should.have.property("PhoneNumber");
                            owner.should.have.property("EmailAddress");
                        });

                        // Ensure that the data we pulled back was correct.
                        response.body[0].should.have.property("Name").eql("Andy A.");
                        response.body[0].should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body[0].should.have.property("PhoneNumber").eql("11111111111");
                        response.body[0].should.have.property("EmailAddress").eql("aardvark@gmail.com");

                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all owners (multiple)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET multiple results when multiple owners exist", function ()
        {
            return new Promise(async function (resolve)
            {
                var firstOwner = new Owner({
                    Name: "Andy A.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                    PhoneNumber: "11111111111",
                    EmailAddress: "aardvark@gmail.com"
                });

                var secondOwner = new Owner({
                    Name: "Barbra B.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/15/letters-3195034__340.png",
                    PhoneNumber: "22222222222",
                    EmailAddress: "baboon@gmail.com"
                });

                var thirdOwner = new Owner({
                    Name: "Chuck C.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/15/letters-3195033__340.png",
                    PhoneNumber: "33333333333",
                    EmailAddress: "cheetah@gmail.com"
                });

                await Owner.create(firstOwner);
                await Owner.create(secondOwner);
                await Owner.create(thirdOwner);

                chai.request(server)
                    .get("/api/owners")
                    .end(function (error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("array");
                        response.body.length.should.be.eql(3);

                        response.body.forEach(function (owner)
                        {
                            owner.should.have.property("Name");
                            owner.should.have.property("Image");
                            owner.should.have.property("PhoneNumber");
                            owner.should.have.property("EmailAddress");

                            resolve();
                        });
                    });


            });
        });
    });

    //===================================================================================================================
    // Get Owner by ID tests (GET to /api/owners/:ownerId)
    //===================================================================================================================
    describe("/GET:ownerId a specific owner", function ()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get an owner with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not GET an owner for an invalid ID", function (done)
        {
            chai.request(server)
                .get("/api/owners/" + "thisIsNotAValidId")
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get an owner with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not GET an owner for an ID that does not exist", function (done)
        {
            chai.request(server)
                .get("/api/owners/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No owner was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Get a single owner by its ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET an owner with a valid ID", function (done)
        {
            var singleOwner = new Owner({
                Name: "Andy A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "11111111111",
                EmailAddress: "aardvark@gmail.com"
            });

            // Create the Owner record that we'll be getting
            singleOwner.save(function (error, newOwner)
            {
                chai.request(server)
                    .get("/api/owners/" + newOwner.id)
                    .end(function (error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Andy A.");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("11111111111");
                        response.body.should.have.property("EmailAddress").eql("aardvark@gmail.com");

                        done();
                    });
            });
        });
    });

    //===================================================================================================================
    // Update Owner by ID tests (PUT to /api/owners/:ownerId)
    //===================================================================================================================
    describe("/PUT:ownerId a specific owner", function ()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update an owner with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not PUT an owner for an invalid ID", function (done)
        {
            var validOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888",
                EmailAddress: "sb411@gmail.com"
            });

            chai.request(server)
                .put("/api/owners/" + "thisIsNotAValidId")
                .send(validOwner)
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update an owner with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not PUT an owner for an ID that does not exist", function (done)
        {
            var validOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888",
                EmailAddress: "sb411@gmail.com"
            });

            chai.request(server)
                .put("/api/owners/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .send(validOwner)
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No owner was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update an owner with a valid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should PUT an owner with a valid ID and all fields", function (done)
        {
            var singleOwner = new Owner({
                Name: "Andy A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "11111111111",
                EmailAddress: "aardvark@gmail.com"
            });

            // Create the Owner record that we'll be getting
            singleOwner.save(function (error, newOwner)
            {
                var updatedOwner = new Owner({
                    Name: "Andy A. - UPDATED",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                    PhoneNumber: "15151515151",
                    EmailAddress: "aardvark@gmail.com"
                });

                chai.request(server)
                    .put("/api/owners/" + newOwner.id)
                    .send(updatedOwner)
                    .end(function (error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Andy A. - UPDATED");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("15151515151");
                        response.body.should.have.property("EmailAddress").eql("aardvark@gmail.com");

                        done();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update an owner with a valid ID and only some fields
        //-------------------------------------------------------------------------------------------------------------------
        it("it should PUT an owner with a valid ID and some fields", function (done)
        {
            var singleOwner = new Owner({
                Name: "Andy A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "11111111111",
                EmailAddress: "aardvark@gmail.com"
            });

            // Create the Owner record that we'll be getting
            singleOwner.save(function (error, newOwner)
            {
                var updatedOwner = new Owner({
                    Name: "Andy A. - UPDATED",
                    PhoneNumber: "15151515151",
                });

                chai.request(server)
                    .put("/api/owners/" + newOwner.id)
                    .send(updatedOwner)
                    .end(function (error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Andy A. - UPDATED");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("15151515151");
                        response.body.should.have.property("EmailAddress").eql("aardvark@gmail.com");

                        done();
                    });
            });
        });
    });

    //===================================================================================================================
    // Delete Owner by ID tests (DELETE to /api/owners/:ownerId)
    //===================================================================================================================
    describe("/DELETE:ownerId a specific owner", function ()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete an owner with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not DELETE an owner for an invalid ID", function (done)
        {
            chai.request(server)
                .delete("/api/owners/" + "thisIsNotAValidId")
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete an owner with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not DELETE an owner for an ID that does not exist", function (done)
        {
            chai.request(server)
                .delete("/api/owners/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .end(function (error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No owner was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete an owner with a valid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should DELETE an owner with a valid ID", function (done)
        {
            var singleOwner = new Owner({
                Name: "Andy A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "11111111111",
                EmailAddress: "aardvark@gmail.com"
            });

            // Create the Owner record that we'll be getting
            singleOwner.save(function (error, newOwner)
            {
                chai.request(server)
                    .delete("/api/owners/" + newOwner.id)
                    .end(function (error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Andy A.");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("11111111111");
                        response.body.should.have.property("EmailAddress").eql("aardvark@gmail.com");

                        // validate that the owner was actually deleted.
                        chai.request(server)
                            .get("/api/owners/" + newOwner.id)
                            .end(function (error, response)
                            {
                                response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                                response.body.should.be.a("object");
                                response.body.should.have.property("message").eql("No owner was found for ID \"" + newOwner.id + "\".");
                                done();
                            });
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete an owner associated with Stay records
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This validation is not yet implemented, but should be.
    });
});
