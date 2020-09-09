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

// Parent block for Sitters
describe("Sitters", function()
{
    // The default of 2 seconds probably isn't enough, so bump it up to 10.
    this.timeout(10000);

    before(function (done)
    {
        testMongoose.connect(config.mongoDbUrl);

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

    after(function (done)
    {
        return testMongoose.disconnect(done);
    });

    //===================================================================================================================
    // Create Sitter tests (POST to /api/sitters)
    //===================================================================================================================
    describe("/POST sitter", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a valid sitter with no stays
        //-------------------------------------------------------------------------------------------------------------------
        it("it should POST a valid sitter without stays", function(done)
        {
            var validNoStaysSitter = new Sitter({
                Name: "Jimmy C.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                EmailAddress: "jc586@outlook.com",
                Stays: []
            });
            
            chai.request(server)
                .post("/api/sitters")
                .send(validNoStaysSitter)
                .end(function(error, response)
                {
                    response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("Name").eql("Jimmy C.");
                    response.body.should.have.property("Image").eql("http://avatars0.githubusercontent.com/u/13400555?s=460&v=4");
                    response.body.should.have.property("PhoneNumber").eql("99999999999");
                    response.body.should.have.property("EmailAddress").eql("jc586@outlook.com");
                    response.body.should.have.property("Stays");
                    response.body.Stays.length.should.be.eql(0);
                    response.body.should.have.property("NumberOfStays").eql(0);
                    response.body.should.have.property("SitterScore").eql(((5 / 26) * 5));
                    response.body.should.have.property("RatingsScore").eql(0);
                    response.body.should.have.property("OverallSitterRank").eql(((5 / 26) * 5));
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a sitter without a Name
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a sitter without Name field", function(done)
        {
            var noNameSitter = new Sitter({
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                EmailAddress: "jc586@outlook.com",
                Stays: []
            });
            
            chai.request(server)
                .post("/api/sitters")
                .send(noNameSitter)
                .end(function(error, response)
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
        // Attempt to create a sitter without a PhoneNumber
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a sitter without PhoneNumber field", function(done)
        {
            var noPhoneNumberSitter = new Sitter({
                Name: "Jimmy C.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                EmailAddress: "jc586@outlook.com",
                Stays: []
            });
            
            chai.request(server)
                .post("/api/sitters")
                .send(noPhoneNumberSitter)
                .end(function(error, response)
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
        // Attempt to create a sitter without a EmailAddress
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a sitter without EmailAddress field", function(done)
        {
            var noEmailAddressSitter = new Sitter({
                Name: "Jimmy C.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                Stays: []
            });    
            
            chai.request(server)
                .post("/api/sitters")
                .send(noEmailAddressSitter)
                .end(function(error, response)
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

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a valid sitter with one stay
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a sitter with a stay", function(done)
        {
            var validOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                EmailAddress: "sb411@gmail.com"
            });
            
            validOwner.save(function(error, newOwner)
            {
                var validStay = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: newOwner.id
                });

                validStay.save(function(error, newStay)
                {
                    var validOneStaySitter = new Sitter({
                        Name: "Jimmy C.",
                        Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                        PhoneNumber: "99999999999",
                        EmailAddress: "jc586@outlook.com",
                        Stays: [newStay.id]
                    });

                    chai.request(server)
                        .post("/api/sitters")
                        .send(validOneStaySitter)
                        .end(function(error, response)
                        {
                            response.should.have.status(501); // TODO: Figure out if there's a way I can check the response message too.
                            response.body.should.be.a("object");
                            response.body.should.have.property("message").eql("Adding a new sitter with stays is not supported yet.");
                            done();
                        });
                });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to create a valid sitter with multiple stays
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not POST a sitter with multiple stays", function(done)
        {
            var validOwner = new Owner({
                Name: "Scott B.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                EmailAddress: "sb411@gmail.com"
            });
            
            validOwner.save(function(error, newOwner)
            {
                var validStayOne = new Stay({
                    Dogs: "Max",
                    StartDate: "2018-03-10",
                    EndDate: "2018-03-17",
                    ReviewText: "Max had a great time! Would stay again!",
                    Rating: 5,
                    Owner: newOwner.id
                });

                validStayOne.save(function(error, newStayOne)
                {
                    var validStayTwo = new Stay({
                        Dogs: "Max|Lucky",
                        StartDate: "2018-04-04",
                        EndDate: "2018-04-08",
                        ReviewText: "Both dogs can be a handful.",
                        Rating: 4,
                        Owner: newOwner.id
                    });

                    validStayTwo.save(function(error, newStayTwo)
                    {
                        var validStayThree = new Stay({
                            Dogs: "Max|Zeus",
                            StartDate: "2018-03-10",
                            EndDate: "2018-03-17",
                            ReviewText: "Puppies are great!",
                            Rating: 5,
                            Owner: newOwner.id
                        });

                        validStayThree.save(function(error, newStayThree)
                        {
                            var validMultiStaySitter = new Sitter({
                                Name: "Jimmy C.",
                                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                                PhoneNumber: "99999999999",
                                EmailAddress: "jc586@outlook.com",
                                Stays: [newStayOne.id, newStayThree.id, newStayThree.id]
                            });

                            chai.request(server)
                                .post("/api/sitters")
                                .send(validMultiStaySitter)
                                .end(function(error, response)
                                {
                                    
                                    response.should.have.status(501); // TODO: Figure out if there's a way I can check the response message too.
                                    response.body.should.be.a("object");
                                    response.body.should.have.property("message").eql("Adding a new sitter with stays is not supported yet.");
                                    done();
                                });
                        });
                    });
                });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // RatingsScore is updated as stays are added.
        //-------------------------------------------------------------------------------------------------------------------
        it("it should update RatingsScore as stays are added", async function()
        {
            return new Promise(async function(resolve)
            {
                var validSitter = new Sitter({
                    Name: "Jimmy C.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "99999999999",
                    EmailAddress: "jc586@outlook.com",
                    Stays: []
                });

                // Create the Sitter record that we'll be using
                var newSitter = await validSitter.save();

                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "99999999999",
                    EmailAddress: "sb411@gmail.com"
                });

                // Create the Sitter record that we'll be using
                var newOwner = await validOwner.save();
                
                var stays = [];

                // Create our list of stays
                for(var i = 0; i < 12; i++)
                {
                    var thisDogs;
                    var thisStartDate = new Date();
                    var thisEndDate = new Date();
                    var thisReviewText;
                    var thisRating;

                    switch (i % 3)
                    {
                        case 0:
                            thisDogs = "Max";
                            thisReviewText = "Max is a good boy!";
                            break;
                        case 1:
                            thisDogs = "Layla";
                            thisReviewText = "Layla is a good girl!";
                            break;
                        case 2:
                            thisDogs = "Max|Lucky";
                            thisReviewText = "Two dogs is a lot to look after.";
                            break;
                        default:
                            thisDogs = "Max";
                            thisReviewText = "Max is a good boy!";
                    }

                    // Set the start and end dates, offset from an arbitrary point in time.
                    thisStartDate.setDate(new Date("2018-03-10").getDate() + (i*7)); 
                    thisEndDate.setDate(new Date("2018-03-16").getDate() + (i*7)); 
                
                    // For random integers between 1 and 5
                    thisRating = Math.floor(Math.random() * 5) + 1;

                    stays.push(new Stay({
                        Dogs: thisDogs,
                        StartDate: thisStartDate,
                        EndDate: thisEndDate,
                        ReviewText: thisReviewText,
                        Rating: thisRating,
                        Owner: newOwner.id
                    }));
                }
                
                // Create our list of stays
                for(var i = 0; i < 12; i++)
                {
                    var thisRequest = new Object();

                    thisRequest.Stay = stays[i];
                    thisRequest.SitterId = newSitter.id;

                    var thisStay = await chai.request(server)
                        .post("/api/stays/")
                        .send(thisRequest);

                    var updatedSitter = await chai.request(server)
                        .get("/api/sitters/" + newSitter.id);

                    updatedSitter.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    updatedSitter.body.should.be.a("object");
                    updatedSitter.body.should.have.property("Name").eql("Jimmy C.");
                    updatedSitter.body.should.have.property("Image").eql("http://avatars0.githubusercontent.com/u/13400555?s=460&v=4");
                    updatedSitter.body.should.have.property("PhoneNumber").eql("99999999999");
                    updatedSitter.body.should.have.property("EmailAddress").eql("jc586@outlook.com"); 
                    updatedSitter.body.should.have.property("Stays");
                    updatedSitter.body.Stays.length.should.be.eql((i + 1), "Stays.length is not equal.");
                    updatedSitter.body.should.have.property("NumberOfStays").eql((i + 1), "NumberOfStays is not equal.");
                
                    // We need to do some math to figure out what our target scores and ranks should be.
                    var ratingsSum = 0;
                    var targetSitterScore = ((5 / 26) * 5);
                    var targetRatingsScore;

                    // Calculate the target RatingsScore
                    for(var j = 0; j <= i; j++)
                    {
                        ratingsSum += stays[j].Rating;
                    }
                
                    targetRatingsScore = (ratingsSum / (i + 1));

                    updatedSitter.body.should.have.property("SitterScore").eql(targetSitterScore, "SitterScore is not equal.");
                    updatedSitter.body.should.have.property("RatingsScore").eql(targetRatingsScore, "RatingsScore is not equal.");
                }

                resolve();
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // OverallSitterRank is updated as stays are added.
        //-------------------------------------------------------------------------------------------------------------------
        it("it should update OverallSitterRank as stays are added", async function()
        {
            return new Promise(async function(resolve)
            {
                var validSitter = new Sitter({
                    Name: "Jimmy C.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "99999999999",
                    EmailAddress: "jc586@outlook.com",
                    Stays: []
                });

                // Create the Sitter record that we'll be using
                var newSitter = await validSitter.save();

                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "99999999999",
                    EmailAddress: "sb411@gmail.com"
                });

                // Create the Sitter record that we'll be using
                var newOwner = await validOwner.save();
                
                var stays = [];

                // Create our list of stays
                for(var i = 0; i < 12; i++)
                {
                    var thisDogs;
                    var thisStartDate = new Date();
                    var thisEndDate = new Date();
                    var thisReviewText;
                    var thisRating;

                    switch (i % 3)
                    {
                        case 0:
                            thisDogs = "Max";
                            thisReviewText = "Max is a good boy!";
                            break;
                        case 1:
                            thisDogs = "Layla";
                            thisReviewText = "Layla is a good girl!";
                            break;
                        case 2:
                            thisDogs = "Max|Lucky";
                            thisReviewText = "Two dogs is a lot to look after.";
                            break;
                        default:
                            thisDogs = "Max";
                            thisReviewText = "Max is a good boy!";
                    }

                    // Set the start and end dates, offset from an arbitrary point in time.
                    thisStartDate.setDate(new Date("2018-03-10").getDate() + (i*7)); 
                    thisEndDate.setDate(new Date("2018-03-16").getDate() + (i*7)); 
                
                    // For random integers between 1 and 5
                    thisRating = Math.floor(Math.random() * 5) + 1;

                    stays.push(new Stay({
                        Dogs: thisDogs,
                        StartDate: thisStartDate,
                        EndDate: thisEndDate,
                        ReviewText: thisReviewText,
                        Rating: thisRating,
                        Owner: newOwner.id
                    }));
                }
                
                // Create our list of stays
                for(var i = 0; i < 12; i++)
                {
                    var thisRequest = new Object();

                    thisRequest.Stay = stays[i];
                    thisRequest.SitterId = newSitter.id;

                    var thisStay = await chai.request(server)
                        .post("/api/stays/")
                        .send(thisRequest);

                    var updatedSitter = await chai.request(server)
                        .get("/api/sitters/" + newSitter.id);

                    updatedSitter.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    updatedSitter.body.should.be.a("object");
                    updatedSitter.body.should.have.property("Name").eql("Jimmy C.");
                    updatedSitter.body.should.have.property("Image").eql("http://avatars0.githubusercontent.com/u/13400555?s=460&v=4");
                    updatedSitter.body.should.have.property("PhoneNumber").eql("99999999999");
                    updatedSitter.body.should.have.property("EmailAddress").eql("jc586@outlook.com"); 
                    updatedSitter.body.should.have.property("Stays");
                    updatedSitter.body.Stays.length.should.be.eql((i + 1), "Stays.length is not equal.");
                    updatedSitter.body.should.have.property("NumberOfStays").eql((i + 1), "NumberOfStays is not equal.");
                
                    // We need to do some math to figure out what our target scores and ranks should be.
                    var ratingsSum = 0;
                    var targetSitterScore = ((5 / 26) * 5);
                    var targetRatingsScore;
                    var targetOverallSitterRank;

                    // Calculate the target RatingsScore
                    for(var j = 0; j <= i; j++)
                    {
                        ratingsSum += stays[j].Rating;
                    }
                
                    targetRatingsScore = (ratingsSum / (i + 1));

                    // Calculate the target OverallSitterRank
                    if(i > 9)
                    {
                        // If more than 10 records, OverallSitterRank should be equal to RatingsScore
                        targetOverallSitterRank = targetRatingsScore;
                    }
                    else
                    {
                        targetOverallSitterRank = ((1 - (0.1 * (i + 1))) * targetSitterScore) + ((0.1 * (i + 1)) * targetRatingsScore);
                    }

                    updatedSitter.body.should.have.property("SitterScore").eql(targetSitterScore, "SitterScore is not equal.");
                    updatedSitter.body.should.have.property("RatingsScore").eql(targetRatingsScore, "RatingsScore is not equal.");
                    // We use within here to reconcile potential differences between how JavaScript and MongoDB do floating point calculations.
                    updatedSitter.body.should.have.property("OverallSitterRank").within((targetOverallSitterRank - 0.00001), (targetOverallSitterRank + 0.00001), "OverallSitterRank is not equal.");
                }

                resolve();
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // OverallSitterRank is calculated correctly based on the spec doc.
        //-------------------------------------------------------------------------------------------------------------------
        it("it should update OverallSitterRank per the spec doc", async function()
        {
            return new Promise(async function(resolve)
            {
                var validSitter = new Sitter({
                    Name: "Abcdefghijklm",
                    Image: "http://cnet3.cbsistatic.com/img/edNENAL1oMyriVHVcjTn-BjPNrg=/fit-in/970x0/2014/12/01/9bcaf58e-5f17-46b9-82a1-546898aad693/count.jpg",
                    PhoneNumber: "12345678901",
                    EmailAddress: "theCount@sesame.street",
                    Stays: []
                });

                // Create the Sitter record that we'll be using
                var newSitter = await validSitter.save();

                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "99999999999",
                    EmailAddress: "sb411@gmail.com"
                });

                // Create the Sitter record that we'll be using
                var newOwner = await validOwner.save();
                
                var stays = [];

                // Create our list of stays
                for(var i = 0; i < 12; i++)
                {
                    var thisDogs;
                    var thisStartDate = new Date();
                    var thisEndDate = new Date();
                    var thisReviewText;

                    switch (i % 3)
                    {
                        case 0:
                            thisDogs = "Max";
                            thisReviewText = "Max is a good boy!";
                            break;
                        case 1:
                            thisDogs = "Layla";
                            thisReviewText = "Layla is a good girl!";
                            break;
                        case 2:
                            thisDogs = "Max|Lucky";
                            thisReviewText = "Two dogs is a lot to look after.";
                            break;
                        default:
                            thisDogs = "Max";
                            thisReviewText = "Max is a good boy!";
                    }

                    // Set the start and end dates, offset from an arbitrary point in time.
                    thisStartDate.setDate(new Date("2018-03-10").getDate() + (i*7)); 
                    thisEndDate.setDate(new Date("2018-03-16").getDate() + (i*7)); 
                
                    // For random integers between 1 and 5
                    thisRating = Math.floor(Math.random() * 5) + 1;

                    stays.push(new Stay({
                        Dogs: thisDogs,
                        StartDate: thisStartDate,
                        EndDate: thisEndDate,
                        ReviewText: thisReviewText,
                        Rating: 5,
                        Owner: newOwner.id
                    }));
                }
                
                // Create our list of stays
                for(var i = 0; i < 12; i++)
                {
                    var thisRequest = new Object();

                    thisRequest.Stay = stays[i];
                    thisRequest.SitterId = newSitter.id;

                    var thisStay = await chai.request(server)
                        .post("/api/stays/")
                        .send(thisRequest);

                    var updatedSitter = await chai.request(server)
                        .get("/api/sitters/" + newSitter.id);

                    updatedSitter.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    updatedSitter.body.should.be.a("object");
                    updatedSitter.body.should.have.property("Name").eql("Abcdefghijklm");
                    updatedSitter.body.should.have.property("Image").eql("http://cnet3.cbsistatic.com/img/edNENAL1oMyriVHVcjTn-BjPNrg=/fit-in/970x0/2014/12/01/9bcaf58e-5f17-46b9-82a1-546898aad693/count.jpg");
                    updatedSitter.body.should.have.property("PhoneNumber").eql("12345678901");
                    updatedSitter.body.should.have.property("EmailAddress").eql("theCount@sesame.street"); 
                    updatedSitter.body.should.have.property("Stays");
                    updatedSitter.body.Stays.length.should.be.eql((i + 1), "Stays.length is not equal.");
                    updatedSitter.body.should.have.property("NumberOfStays").eql((i + 1), "NumberOfStays is not equal.");
                
                    // We need to do some math to figure out what our target scores and ranks should be.
                    var ratingsSum = 0;
                    var targetSitterScore = ((13 / 26) * 5);
                    var targetRatingsScore;
                    var targetOverallSitterRank;

                    // Calculate the target RatingsScore
                    for(var j = 0; j <= i; j++)
                    {
                        ratingsSum += stays[j].Rating;
                    }
                
                    targetRatingsScore = (ratingsSum / (i + 1));

                    // For this test, we'll use the arbitrary values from the spec doc.
                    switch((i + 1))
                    {
                        case 1:
                            targetOverallSitterRank = 2.75;
                            break;
                        case 2:
                            targetOverallSitterRank = 3;
                            break;
                        case 3:
                            targetOverallSitterRank = 3.25;
                            break;
                        case 4:
                            targetOverallSitterRank = 3.5;
                            break;
                        case 5:
                            targetOverallSitterRank = 3.75;
                            break;
                        case 6:
                            targetOverallSitterRank = 4;
                            break;
                        case 7:
                            targetOverallSitterRank = 4.25;
                            break;
                        case 8:
                            targetOverallSitterRank = 4.5;
                            break;
                        case 9:
                            targetOverallSitterRank = 4.75;
                            break;
                        case 10:
                        case 11:
                        case 12:
                            targetOverallSitterRank = 5;
                            break;
                    }

                    updatedSitter.body.should.have.property("SitterScore").eql(targetSitterScore, "SitterScore is not equal.");
                    updatedSitter.body.should.have.property("RatingsScore").eql(targetRatingsScore, "RatingsScore is not equal.");
                    // We use within here to reconcile potential differences between how JavaScript and MongoDB do floating point calculations.
                    updatedSitter.body.should.have.property("OverallSitterRank").within((targetOverallSitterRank - 0.00001), (targetOverallSitterRank + 0.00001), "OverallSitterRank is not equal.");
                }

                resolve();
            });
        });
    });

    //===================================================================================================================
    // Get all Sitters tests (GET to /api/sitters)
    //===================================================================================================================
    describe("/GET all sitters", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all sitters (none)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET no sitters when the collection is empty", function(done)
        {
            chai.request(server)
                .get("/api/sitters")
                .end(function(error, response)
                {
                    response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("array");
                    response.body.length.should.be.eql(0);
                    done();
                });
        });
        
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all sitters (one)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET one result when one sitter exists", async function()
        {
            return new Promise(async function(resolve)
            {
                var singleSitter = new Sitter({
                    Name: "Allison A.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                    PhoneNumber: "44444444444",
                    EmailAddress: "ash@outlook.com",
                    Stays: []
                });
                
                await Sitter.create(singleSitter);

                chai.request(server)
                    .get("/api/sitters")
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("array");
                        response.body.length.should.be.eql(1);

                        response.body.forEach(function(sitter)
                        {
                            sitter.should.have.property("Name");
                            sitter.should.have.property("Image");
                            sitter.should.have.property("PhoneNumber");
                            sitter.should.have.property("EmailAddress");
                            sitter.should.have.property("Stays");
                            sitter.should.have.property("NumberOfStays");
                            sitter.should.have.property("SitterScore");
                            sitter.should.have.property("RatingsScore");
                            sitter.should.have.property("OverallSitterRank");
                        });

                        // Ensure that the data we pulled back was correct.
                        response.body[0].should.have.property("Name").eql("Allison A.");
                        response.body[0].should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body[0].should.have.property("PhoneNumber").eql("44444444444");
                        response.body[0].should.have.property("EmailAddress").eql("ash@outlook.com");
                        response.body[0].should.have.property("Stays");
                        response.body[0].Stays.length.should.be.eql(0);
                        response.body[0].should.have.property("NumberOfStays").eql(0);
                        response.body[0].should.have.property("SitterScore").eql(((6 / 26) * 5));
                        response.body[0].should.have.property("RatingsScore").eql(0);
                        response.body[0].should.have.property("OverallSitterRank").eql(((6 / 26) * 5));
                    });
                
                resolve();
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get all sitters (multiple)
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET multiple results when multiple sitters exist", async function()
        {
            return new Promise(async function(resolve)
            {
                var firstSitter = new Sitter({
                    Name: "Allison A.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                    PhoneNumber: "44444444444",
                    EmailAddress: "ash@outlook.com",
                    Stays: []
                });

                var secondSitter = new Sitter({
                    Name: "Bradley B.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/15/letters-3195034__340.png",
                    PhoneNumber: "55555555555",
                    EmailAddress: "banyan@outlook.com",
                    Stays: []
                });
    
                var thirdSitter = new Sitter({
                    Name: "Cassandra C.",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/15/letters-3195033__340.png",
                    PhoneNumber: "66666666666",
                    EmailAddress: "cherry@outlook.com",
                    Stays: []
                });

                await Sitter.create(firstSitter);
                await Sitter.create(secondSitter);
                await Sitter.create(thirdSitter);

                chai.request(server)
                    .get("/api/sitters")
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("array");
                        response.body.length.should.be.eql(3);

                        response.body.forEach(function(sitter)
                        {
                            sitter.should.have.property("Name");
                            sitter.should.have.property("Image");
                            sitter.should.have.property("PhoneNumber");
                            sitter.should.have.property("EmailAddress");
                            sitter.should.have.property("Stays");
                            sitter.should.have.property("NumberOfStays");
                            sitter.should.have.property("SitterScore");
                            sitter.should.have.property("RatingsScore");
                            sitter.should.have.property("OverallSitterRank");
                        });
                    });
                
                resolve();
            });
        });
    });

    //===================================================================================================================
    // Get Sitter by ID tests (GET to /api/sitters/:sitterId)
    //===================================================================================================================
    describe("/GET:sitterId a specific sitter", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get a sitter with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not GET a sitter for an invalid ID", function(done)
        {
            chai.request(server)
                .get("/api/sitters/" + "thisIsNotAValidId")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to get a sitter with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not GET a sitter for an ID that does not exist", function(done)
        {
            chai.request(server)
                .get("/api/sitters/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No sitter was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Get a single sitter by its ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should GET a sitter with a valid ID", function(done)
        {
            var singleSitter = new Sitter({
                Name: "Allison A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "44444444444",
                EmailAddress: "ash@outlook.com",
                Stays: []
            });
            
            // Create the Sitter record that we'll be getting
            singleSitter.save(function(error, newSitter)
            {
                chai.request(server)
                    .get("/api/sitters/" + newSitter.id)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Allison A.");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("44444444444");
                        response.body.should.have.property("EmailAddress").eql("ash@outlook.com"); 
                        response.body.should.have.property("Stays");
                        response.body.Stays.length.should.be.eql(0);
                        response.body.should.have.property("NumberOfStays").eql(0);
                        response.body.should.have.property("SitterScore").eql(((6 / 26) * 5));
                        response.body.should.have.property("RatingsScore").eql(0);
                        response.body.should.have.property("OverallSitterRank").eql(((6 / 26) * 5));
                        done();
                    });
            });
        });
    });

    //===================================================================================================================
    // Update Sitter by ID tests (PUT to /api/sitters/:sitterId)
    //===================================================================================================================
    describe("/PUT:sitterId a specific sitter", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a sitter with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not PUT a sitter for an invalid ID", function(done)
        {
            var validSitter = new Sitter({
                Name: "Jimmy C.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                EmailAddress: "jc586@outlook.com",
                Stays: []
            });
            
            chai.request(server)
                .put("/api/sitters/" + "thisIsNotAValidId")
                .send(validSitter)
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a sitter with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not PUT a sitter for an ID that does not exist", function(done)
        {
            var validSitter = new Sitter({
                Name: "Jimmy C.",
                Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                PhoneNumber: "99999999999",
                EmailAddress: "jc586@outlook.com",
                Stays: []
            });
            
            chai.request(server)
                .put("/api/sitters/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .send(validSitter)
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No sitter was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a sitter with a valid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should PUT a sitter with a valid ID and all fields", function(done)
        {
            var singleSitter = new Sitter({
                Name: "Allison A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "44444444444",
                EmailAddress: "ash@outlook.com",
                Stays: []
            });
            
            // Create the Sitter record that we'll be getting
            singleSitter.save(function(error, newSitter)
            {
                var updatedSitter = new Sitter({
                    Name: "Allison A. - UPDATED",
                    Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                    PhoneNumber: "15151515151",
                    EmailAddress: "ash@outlook.com",
                    Stays: []
                });
                
                chai.request(server)
                    .put("/api/sitters/" + newSitter.id)
                    .send(updatedSitter)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Allison A. - UPDATED");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("15151515151");
                        response.body.should.have.property("EmailAddress").eql("ash@outlook.com");
                        response.body.should.have.property("Stays");
                        response.body.Stays.length.should.be.eql(0);
                        response.body.should.have.property("NumberOfStays").eql(0);
                        response.body.should.have.property("SitterScore").eql(((11 / 26) * 5));
                        response.body.should.have.property("RatingsScore").eql(0);
                        response.body.should.have.property("OverallSitterRank").eql(((11 / 26) * 5));
                        done();
                    });
            });
        });
       
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to update a sitter with a valid ID and only some fields
        //-------------------------------------------------------------------------------------------------------------------
        it("it should PUT a sitter with a valid ID and some fields", function(done)
        {
            var singleSitter = new Sitter({
                Name: "Allison A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "44444444444",
                EmailAddress: "ash@outlook.com",
                Stays: []
            });
            
            // Create the Sitter record that we'll be getting
            singleSitter.save(function(error, newSitter)
            {
                var updatedSitter = new Sitter({
                    Name: "Allison A. - UPDATED",
                    PhoneNumber: "15151515151",
                });
                
                chai.request(server)
                    .put("/api/sitters/" + newSitter.id)
                    .send(updatedSitter)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Allison A. - UPDATED");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("15151515151");
                        response.body.should.have.property("EmailAddress").eql("ash@outlook.com"); 
                        response.body.should.have.property("Stays");
                        response.body.Stays.length.should.be.eql(0);
                        response.body.should.have.property("NumberOfStays").eql(0);
                        response.body.should.have.property("SitterScore").eql(((11 / 26) * 5));
                        response.body.should.have.property("RatingsScore").eql(0);
                        response.body.should.have.property("OverallSitterRank").eql(((11 / 26) * 5));
                        done();
                    });
            });
        });
    });

    //===================================================================================================================
    // Delete Sitter by ID tests (DELETE to /api/sitters/:sitterId)
    //===================================================================================================================
    describe("/DELETE:sitterId a specific sitter", function()
    {
        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a sitter with an invalid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not DELETE a sitter for an invalid ID", function(done)
        {
            chai.request(server)
                .delete("/api/sitters/" + "thisIsNotAValidId")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("The supplied id \"thisIsNotAValidId\" is not a valid mongoose id.");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a sitter with an ID that does not exist
        //-------------------------------------------------------------------------------------------------------------------
        it("it should not DELETE a sitter for an ID that does not exist", function(done)
        {
            chai.request(server)
                .delete("/api/sitters/" + "1a2b3c4d5e6f7a8b9c0d1e2f")
                .end(function(error, response)
                {
                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                    response.body.should.be.a("object");
                    response.body.should.have.property("message").eql("No sitter was found for ID \"1a2b3c4d5e6f7a8b9c0d1e2f\".");
                    done();
                });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a sitter with a valid ID
        //-------------------------------------------------------------------------------------------------------------------
        it("it should DELETE a sitter with a valid ID", function(done)
        {
            var singleSitter = new Sitter({
                Name: "Allison A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "44444444444",
                EmailAddress: "ash@outlook.com",
                Stays: []
            });
            
            // Create the Sitter record that we'll be getting
            singleSitter.save(function(error, newSitter)
            {
                chai.request(server)
                    .delete("/api/sitters/" + newSitter.id)
                    .end(function(error, response)
                    {
                        response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                        response.body.should.be.a("object");
                        response.body.should.have.property("Name").eql("Allison A.");
                        response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                        response.body.should.have.property("PhoneNumber").eql("44444444444");
                        response.body.should.have.property("EmailAddress").eql("ash@outlook.com");
                        response.body.should.have.property("Stays");
                        response.body.Stays.length.should.be.eql(0);
                        response.body.should.have.property("NumberOfStays").eql(0);
                        response.body.should.have.property("SitterScore").eql(((6 / 26) * 5));
                        response.body.should.have.property("RatingsScore").eql(0);
                        response.body.should.have.property("OverallSitterRank").eql(((6 / 26) * 5)); 

                        // validate that the sitter was actually deleted.
                        chai.request(server)
                            .get("/api/sitters/" + newSitter.id)
                            .end(function(error, response)
                            {
                                response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                                response.body.should.be.a("object");
                                response.body.should.have.property("message").eql("No sitter was found for ID \"" + newSitter.id + "\".");
                                done();
                            });
                    });
            });
        });

        //-------------------------------------------------------------------------------------------------------------------
        // Attempt to delete a sitter with a valid ID and Stays
        //-------------------------------------------------------------------------------------------------------------------
        // TODO: This test is REALLY messy. I should clean it up.
        // TODO: This test currently is not working due to a limitation in the Sitter implementation.
        it.skip("it should DELETE a stays associated with a valid sitter ID", function(done)
        {
            var singleSitter = new Sitter({
                Name: "Allison A.",
                Image: "http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png",
                PhoneNumber: "44444444444",
                EmailAddress: "ash@outlook.com",
                Stays: []
            });
            
            // Create the Sitter record that we'll be getting
            singleSitter.save(function(error, newSitter)
            {
                var validOwner = new Owner({
                    Name: "Scott B.",
                    Image: "http://avatars0.githubusercontent.com/u/13400555?s=460&v=4",
                    PhoneNumber: "99999999999",
                    EmailAddress: "sb411@gmail.com"
                });
                
                validOwner.save(function(error, newOwner)
                {
                    var requestOne = new Object();

                    var validStayOne = new Stay({
                        Dogs: "Max",
                        StartDate: "2018-03-10",
                        EndDate: "2018-03-17",
                        ReviewText: "Max had a great time! Would stay again!",
                        Rating: 5,
                        Owner: newOwner.id
                    });

                    requestOne.SitterId = newSitter.id;
                    requestOne.Stay = validStayOne;

                    // We need to make this call through to API to ensure that the Sitter is updated with the Stay
                    chai.request(server)
                        .post("/api/stays/")
                        .send(requestOne)
                        .end(function(error, response)
                        {
                            var stayOneId = response.id;
                            
                            var requestTwo = new Object();

                            var validStayTwo = new Stay({
                                Dogs: "Max|Lucky",
                                StartDate: "2018-04-04",
                                EndDate: "2018-04-08",
                                ReviewText: "Both dogs can be a handful.",
                                Rating: 4,
                                Owner: newOwner.id
                            });

                            requestTwo.SitterId = newSitter.id;
                            requestTwo.Stay = validStayTwo;

                            // We need to make this call through to API to ensure that the Sitter is updated with the Stay
                            chai.request(server)
                                .post("/api/stays/")
                                .send(requestTwo)
                                .end(function(error, response)
                                {
                                    var stayTwoId = response.id;

                                    chai.request(server)
                                        .delete("/api/sitters/" + newSitter.id)
                                        .end(function(error, response)
                                        {
                                            response.should.have.status(200); // TODO: Figure out if there's a way I can check the response message too.
                                            response.body.should.be.a("object");
                                            response.body.should.have.property("Name").eql("Allison A.");
                                            response.body.should.have.property("Image").eql("http://cdn.pixabay.com/photo/2018/03/03/07/14/letters-3195031_960_720.png");
                                            response.body.should.have.property("PhoneNumber").eql("44444444444");
                                            response.body.should.have.property("EmailAddress").eql("ash@outlook.com");
                                            response.body.should.have.property("Stays");
                                            response.body.Stays.length.should.be.eql(2);
                                            response.body.should.have.property("NumberOfStays").eql(2);
                                            response.body.should.have.property("SitterScore").eql(((6 / 26) * 5));
                                            response.body.should.have.property("RatingsScore").eql(4.5);
                                            response.body.should.have.property("OverallSitterRank").eql((0.8*((6 / 26) * 5))+(0.2 * 4.5));

                                            // Validate that the sitter was actually deleted.
                                            chai.request(server)
                                                .get("/api/sitters/" + newSitter.id)
                                                .end(function(error, response)
                                                {
                                                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                                                    response.body.should.be.a("object");
                                                    response.body.should.have.property("message").eql("No sitter was found for ID \"" + newSitter.id + "\".");

                                                    // Validate that the first Stay was actually deleted.
                                                    chai.request(server)
                                                        .get("/api/stays/" + stayOneId)
                                                        .end(function(error, response)
                                                        {
                                                            response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                                                            response.body.should.be.a("object");
                                                            response.body.should.have.property("message").eql("No stay was found for ID \"" + stayOneId + "\".");

                                                            // Validate that the second Stay was actually deleted.
                                                            chai.request(server)
                                                                .get("/api/stays/" + stayTwoId)
                                                                .end(function(error, response)
                                                                {

                                                                    response.should.have.status(400); // TODO: Figure out if there's a way I can check the response message too.
                                                                    response.body.should.be.a("object");
                                                                    response.body.should.have.property("message").eql("No stay was found for ID \"" + stayTwoId + "\".");

                                                                    done();
                                                                });
                                                        });
                                                });
                                        });
                                });
                        });
                });
            });
        });
    });
});
