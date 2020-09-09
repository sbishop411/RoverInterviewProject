// Mongoose and schema includes.
var config = require(__dirname + "/../../config/config");


let testMongoose = require("mongoose");
testMongoose.connect(config.mongoDbUrl);

require(__dirname + "/../../src/server/models/Sitter");
require(__dirname + "/../../src/server/models/Stay");
require(__dirname + "/../../src/server/models/Owner");
//let Sitter = testMongoose.model("Sitter");
//let Stay = testMongoose.model("Stay");
//let Owner = testMongoose.model("Owner");

// Get Chai set up.
let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);

// This is the main webserver.
let server = require(__dirname + "/../../src/server");

// Parent block for Stays
describe("Stays", function ()
{
    // The default of 2 seconds probably isn't enough, so bump it up to 10.
    this.timeout(10000);

    before(function (done)
    {
        //testMongoose.connect(config.mongoDbUrl);

        let Sitter = testMongoose.model("Sitter");
        let Stay = testMongoose.model("Stay");
        let Owner = testMongoose.model("Owner");
        done();
    });

    // Empty out the Owner, Sitter, and Stay collections before every test. This will help keep our tests clean and our dependencies in check.
    beforeEach(async () =>
    {
        await Owner.remove({});
        await Stay.remove({});
        await Sitter.remove({});
    });
    
    after(async () =>
    {
        await Owner.remove({});
        await Stay.remove({});
        await Sitter.remove({});

        testMongoose.disconnect();
    });
    
    //===================================================================================================================
    // Create Stay tests (POST to /api/stays)
    //===================================================================================================================
    describe("/POST stay", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a valid stay
        //-------------------------------------------------------------------------------------------------------------------
        it("it should POST a valid stay", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = validStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Dogs").eql("Max");
                        response.body.should.have.property("StartDate").eql(new Date("2018-03-10").toISOString());
                        response.body.should.have.property("EndDate").eql(new Date("2018-03-17").toISOString());
                        response.body.should.have.property("ReviewText").eql("Max had a great time! Would stay again!");
                        response.body.should.have.property("Rating").eql(5);
                        response.body.should.have.property("Owner").eql(thisOwner.id);
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay without Dogs
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay without Dogs field", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noDogsStay = new Stay({
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noDogsStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("Dogs");
                        response.body.message.errors.Dogs.should.have.property("kind").eql("required");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay without StartDate
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay without StartDate field", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noStartDateStay = new Stay({
                    Dogs: "Max",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noStartDateStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("StartDate");
                        response.body.message.errors.StartDate.should.have.property("kind").eql("required");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay without EndDate
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay without EndDate field", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noEndDateStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noEndDateStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("EndDate");
                        response.body.message.errors.EndDate.should.have.property("kind").eql("required");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay without Rating
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay without Rating field", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noRatingStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noRatingStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("Rating");
                        response.body.message.errors.Rating.should.have.property("kind").eql("required");
                        resolve();
                    });
            });
        });
        
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay with a Rating below 1
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay with a Rating below 1", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var ratingTooLowStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 0.5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = ratingTooLowStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("Rating");
                        response.body.message.errors.Rating.should.have.property("kind").eql("min");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay with a Rating above 5
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay with a Rating above 5", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var ratingTooLowStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 6,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = ratingTooLowStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("Rating");
                        response.body.message.errors.Rating.should.have.property("kind").eql("max");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay without Owner
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay without Owner field", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noOwnerStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noOwnerStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("name").eql("ValidationError");
                        response.body.message.should.have.property("errors");
                        response.body.message.errors.should.have.property("Owner");
                        response.body.message.errors.Owner.should.have.property("kind").eql("required");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay with an invalid Owner id
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a stay with an invalid Owner id", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noOwnerStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: "thisIsNotAValidId"
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noOwnerStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("message").eql("Stay validation failed: Owner: The stay must be associated with an owner.");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a stay with a non-existent Owner id
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This feature is not yet implemented.
        it.skip("it should not POST a stay with a non-existent Owner id", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var noOwnerStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: "1a2b3c4d5e6f7a8b9c0d1e2f"
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = noOwnerStay;

                chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest)
                    .end(function(error, response)
                    {
                        response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.message.should.have.property("message").eql("Stay validation failed: Owner: The stay must be associated with an owner.");
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Associated sitter's NumberOfStays is updated when a stay is added
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: Implement this test.
        it.skip("it should update the sitter's NumberOfStays when a stay is added", function(done)
        {

        });
    });

    //===================================================================================================================
    // Get all Stays tests (GET to /api/stays)
    //===================================================================================================================
    describe("/GET all stays", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all stays (none)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET no stays when the collection is empty", function(done)
        {
            chai.request(server)
                .get("/api/stays")
                .end(function(error, response)
                {
                    response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("array");
                    response.body.length.should.be.eql(0);
                    done();
                });
        });
        
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all stays (one)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET one result when one stay exists", async function()
        {   
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = validStay;

                await chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest);

                chai.request(server)
                    .get("/api/stays")
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("array");
                        response.body.length.should.be.eql(1);

                        response.body.forEach(function(stay)
                        {
                            stay.should.have.property("Dogs");
                            stay.should.have.property("StartDate");
                            stay.should.have.property("EndDate");
                            stay.should.have.property("ReviewText");
                            stay.should.have.property("Rating");
                            stay.should.have.property("Owner");
                        });

                        // Ensure that the data we pulled back was correct.
                        response.body[0].should.have.property("Dogs").eql("Max");
                        response.body[0].should.have.property("StartDate").eql(new Date("2018-03-10").toISOString());
                        response.body[0].should.have.property("EndDate").eql(new Date("2018-03-17").toISOString());
                        response.body[0].should.have.property("ReviewText").eql("Max had a great time! Would stay again!");
                        response.body[0].should.have.property("Rating").eql(5);
                        response.body[0].should.have.property("Owner").eql(thisOwner.id);
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all stays (multiple)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET multiple results when multiple stays exist", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var stayOne = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });

                var stayOneRequest = new Object();
                stayOneRequest.SitterId = thisSitter.id;
                stayOneRequest.Stay = stayOne;

                var stayTwo = new Stay({
                    Dogs: "Max|Lucky",
                    StartDate: "2018-04-04",
                    EndDate: "2018-04-08",
                    ReviewText: "Lucky is a real hassle.",
                    Rating: 2,
                    Owner: thisOwner.id
                });

                var stayTwoRequest = new Object();
                stayTwoRequest.SitterId = thisSitter.id;
                stayTwoRequest.Stay = stayTwo;

                var stayThree = new Stay({
                    Dogs: "Max|Layla",
                    StartDate: "2018-04-24",
                    EndDate: "2018-04-28",
                    ReviewText: "Pretty good, but Layla is really lazy.",
                    Rating: 4,
                    Owner: thisOwner.id
                });
                
                var stayThreeRequest = new Object();
                stayThreeRequest.SitterId = thisSitter.id;
                stayThreeRequest.Stay = stayThree;

                await chai.request(server)
                    .post("/api/stays")
                    .send(stayOneRequest);

                await chai.request(server)
                    .post("/api/stays")
                    .send(stayTwoRequest);

                await chai.request(server)
                    .post("/api/stays")
                    .send(stayThreeRequest);

                chai.request(server)
                    .get("/api/stays")
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("array");
                        response.body.length.should.be.eql(3);

                        response.body.forEach(function(stay)
                        {
                            stay.should.have.property("Dogs");
                            stay.should.have.property("StartDate");
                            stay.should.have.property("EndDate");
                            stay.should.have.property("ReviewText");
                            stay.should.have.property("Rating");
                            stay.should.have.property("Owner");
                        });

                        resolve();
                    });
            });
        });
    });

    //===================================================================================================================
    // Get Stay by ID tests (GET to /api/stays/:stayId)
    //===================================================================================================================
    describe("/GET:stayId a specific stay", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get a stay with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not GET a stay for an invalid ID", function(done)
        {
            chai.request(server)
                .get("/api/stays/" + "thisIsNotAValidId")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get a stay with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not GET a stay for an ID that does not exist", function(done)
        {
            chai.request(server)
                .get("/api/stays/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No stay was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Get a single stay by its ID
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This test is currently broken. We're not receiving the correct response when adding a stay.
        it.skip("it should GET a stay with a valid ID", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = validStay;

                var newStay = await chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest);

                chai.request(server)
                    .get("/api/stays/" + newStay.id)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.

                        // Using the below line to debug the response that I'm getting.
                        //response.should.have.status(JSON.stringify(newStay)); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Dogs").eql("Max");
                        response.body.should.have.property("StartDate").eql(new Date("2018-03-10").toISOString());
                        response.body.should.have.property("EndDate").eql(new Date("2018-03-17").toISOString());
                        response.body.should.have.property("ReviewText").eql("Max had a great time! Would stay again!");
                        response.body.should.have.property("Rating").eql(5);
                        resolve();
                    });
            });
        });
    });

    //===================================================================================================================
    // Update Stay by ID tests (PUT to /api/stays/:stayId)
    //===================================================================================================================
    describe("/PUT:stayId a specific stay", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a stay with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not PUT a stay for an invalid ID", function(done)
        {
            var validStay = new Stay({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888",
                EmailAddress: "sb411@gmail.com"
            });
            
            chai.request(server)
                .put("/api/stays/" + "thisIsNotAValidId")
                .send(validStay)
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a stay with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not PUT a stay for an ID that does not exist", function(done)
        {
            var validStay = new Stay({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "88888888888",
                EmailAddress: "sb411@gmail.com"
            });
            
            chai.request(server)
                .put("/api/stays/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .send(validStay)
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No stay was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a stay with a valid ID
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This test is currently broken. We're not receiving the correct response when adding a stay.
        // This is the same issue as Get a single stay by its ID
        it.skip("it should PUT a stay with a valid ID and all fields", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = validStay;

                var newStay = await chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest);

                var updatedStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Maybe it wasn't so good.",
                    Rating: 4,
                    Owner: thisOwner.id
                });
                
                chai.request(server)
                    .put("/api/stays/" + newStay.id)
                    .send(updatedStay)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.

                        // Using the below line to debug the response that I'm getting.
                        //response.should.have.status(JSON.stringify(newStay)); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Dogs").eql("Max");
                        response.body.should.have.property("StartDate").eql(new Date("2018-03-10").toISOString());
                        response.body.should.have.property("EndDate").eql(new Date("2018-03-17").toISOString());
                        response.body.should.have.property("ReviewText").eql("Maybe it wasn't so good.");
                        response.body.should.have.property("Rating").eql(4);
                        resolve();
                    });
            });
        });
        
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a stay with a valid ID and only some fields
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This test is currently broken. We're not receiving the correct response when adding a stay.
        // This is the same issue as Get a single stay by its ID
        it.skip("it should PUT a stay with a valid ID and some fields", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = validStay;

                var newStay = await chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest);

                var updatedStay = new Stay({
                    ReviewText: "Maybe it wasn't so good.",
                    Rating: 4,
                    Owner: thisOwner.id
                });
                
                chai.request(server)
                    .put("/api/stays/" + newStay.id)
                    .send(updatedStay)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.

                        // Using the below line to debug the response that I'm getting.
                        //response.should.have.status(JSON.stringify(newStay)); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Dogs").eql("Max");
                        response.body.should.have.property("StartDate").eql(new Date("2018-03-10").toISOString());
                        response.body.should.have.property("EndDate").eql(new Date("2018-03-17").toISOString());
                        response.body.should.have.property("ReviewText").eql("Maybe it wasn't so good.");
                        response.body.should.have.property("Rating").eql(4);
                        resolve();
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Associated sitter's RatingsScore is updated when a stay's Rating is updated
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: Implement this test.
        it.skip("it should update the sitter's RatingsScore when Rating is changed", function(done)
        {

        });

        //-------------------------------------------------------------------------------------------------------------------
        // Associated sitter's OverallSitterRank is updated when a stay's Rating is updated
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: Implement this test.
        it.skip("it should update the sitter's OverallSitterRank when Rating is changed", function(done)
        {

        });
    });

    //===================================================================================================================
    // Delete Stay by ID tests (DELETE to /api/stays/:stayId)
    //===================================================================================================================
    describe("/DELETE:stayId a specific stay", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a stay with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not DELETE a stay for an invalid ID", function(done)
        {
            chai.request(server)
                .delete("/api/stays/" + "thisIsNotAValidId")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a stay with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not DELETE a stay for an ID that does not exist", function(done)
        {
            chai.request(server)
                .delete("/api/stays/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No stay was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });
        
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a stay with a valid ID
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This test is currently broken. We're not receiving the correct response when adding a stay.
        // This is the same issue as Get a single stay by its ID
        it.skip("it should DELETE a stay with a valid ID", async function()
        {
            return new Promise(async function(resolve)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "88888888888",
                    EmailAddress: "sb411@gmail.com"
                });
                
                var validSitter = new Sitter({
                    Name: "Krystal R",
                    Image: "http://cdn1-www.dogtime.com/assets/uploads/gallery/pit-bull-dog-breed-pictures/pit-bull-dog-breed-picture-10.jpg",
                    PhoneNumber: "12223334444",
                    EmailAddress: "kr@hotmail.com",
                    Stays: []
                });
                
                // Create the Owner and Sitter
                var thisOwner = await validOwner.save();
                var thisSitter = await validSitter.save();

                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: thisOwner.id
                });
                
                var stayRequest = new Object();
                stayRequest.SitterId = thisSitter.id;
                stayRequest.Stay = validStay;

                var newStay = await chai.request(server)
                    .post("/api/stays")
                    .send(stayRequest);

                var updatedStay = new Stay({
                    ReviewText: "Maybe it wasn't so good.",
                    Rating: 4,
                    Owner: thisOwner.id
                });
                
                chai.request(server)
                    .delete("/api/stays/" + newStay.id)
                    .send(updatedStay)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.

                        // Using the below line to debug the response that I'm getting.
                        //response.should.have.status(JSON.stringify(newStay)); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Dogs").eql("Max");
                        response.body.should.have.property("StartDate").eql(new Date("2018-03-10").toISOString());
                        response.body.should.have.property("EndDate").eql(new Date("2018-03-17").toISOString());
                        response.body.should.have.property("ReviewText").eql("Maybe it wasn't so good.");
                        response.body.should.have.property("Rating").eql(4);

                        // validate that the stay was actually deleted.
                        chai.request(server)
                        .get("/api/stays/" + newStay.id)
                        .end(function(error, response)
                        {
                            response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                            response.body.should.be.a("object");
                            response.body.should.have.property("message").eql("No stay was found for ID \"" + newStay.id + "\".");
                            resolve();
                        });
                        
                    });
            });
        });
    });
});
