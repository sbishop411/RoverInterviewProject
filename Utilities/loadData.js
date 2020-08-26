//==========================================================
// Includes and configuration
//==========================================================
require(__dirname + "/../server/models/Sitter");
require(__dirname + "/../server/models/Stay");
require(__dirname + "/../server/models/Owner");
var programArgs = require("./node_modules/commander");
var fileStream = require("fs");
var csv = require("./node_modules/csv");
var mongoose = require("mongoose");
// TODO: Replace this with however we're getting the config data in server.js
var config = require(__dirname + "/../config/config");
var csvParser = require("./node_modules/csv-parse/lib/sync");

//==========================================================
// Helper objects and methods
//==========================================================

// Class to represent one row from the CSV file.
function scrapedReview(StayRatingVal, SitterImageVal, StayEndDateVal, StayTextVal, OwnerImageVal, StayDogsVal, SitterNameVal, OwnerNameVal, StayStartDateVal, SitterPhoneNumberVal, SitterEmailAddressVal, OwnerPhoneNumberVal, OwnerEmailAddressVal)
{
    this.StayRating = StayRatingVal;
    this.SitterImage = SitterImageVal;
    this.StayEndDate = StayEndDateVal;
    this.StayText = StayTextVal;
    this.OwnerImage = OwnerImageVal;
    this.StayDogs = StayDogsVal;
    this.SitterName = SitterNameVal;
    this.OwnerName = OwnerNameVal;
    this.StayStartDate = StayStartDateVal;
    this.SitterPhoneNumber = SitterPhoneNumberVal;
    this.SitterEmailAddress = SitterEmailAddressVal;
    this.OwnerPhoneNumber = OwnerPhoneNumberVal;
    this.OwnerEmailAddress = OwnerEmailAddressVal;
};

// Debug method to print out a ScrapedReview.
var printReview = function (review)
{
    console.log("    StayRating: " + review.StayRating);
    console.log("    SitterImage: " + review.SitterImage);
    console.log("    StayEndDate: " + review.StayEndDate);
    if (review.StayText.length > 50)
    {
        console.log("    StayText: " + review.StayText.substring(0, 50) + "...");
    }
    else
    {
        console.log("    StayText: " + review.StayText);
    }
    console.log("    OwnerImage: " + review.OwnerImage);
    console.log("    StayDogs: " + review.StayDogs);
    console.log("    SitterName: " + review.SitterName);
    console.log("    OwnerName: " + review.OwnerName);
    console.log("    StayStartDate: " + review.StayStartDate);
    console.log("    SitterPhoneNumber: " + review.SitterPhoneNumber);
    console.log("    SitterEmailAddress: " + review.SitterEmailAddress);
    console.log("    OwnerPhoneNumber: " + review.OwnerPhoneNumber);
    console.log("    OwnerEmailAddress: " + review.OwnerEmailAddress);
};

// TODO: condense these three methods into one that can handle any mongoose Model in a generic way.
// Async method to save owner data.
async function saveOwnerData(Owner, ownerData)
{
    return new Promise(function (resolve, reject)
    {
        Owner.create(ownerData, function (error, result)
        {
            if (error)
            {
                console.log(error);
                reject(error);
            }

            resolve(result);
        });
    });
};

// Async method to save stay data.
async function saveStayData(Stay, stayData)
{
    return new Promise(function (resolve, reject)
    {
        Stay.create(stayData, function (error, result)
        {
            if (error)
            {
                console.log(error);
                reject(error);
            }

            resolve(result);
        });
    });
};

// Async method to save sitter data.
async function saveSitterData(Sitter, sitterData)
{
    return new Promise(function (resolve, reject)
    {
        Sitter.create(sitterData, function (error, result)
        {
            if (error)
            {
                console.log(error);
                reject(error);
            }

            resolve(result);
        });
    });
};

//==========================================================
// Main script
//==========================================================

// Wrap everything that we want to do in an async function. I should probably get better with Promises...
var loadData = async function ()
{
    //----------------------------------------------------------
    // Setup and validate command line arguments.
    //----------------------------------------------------------
    programArgs
        .version("1.0")
        .option("-f, --filePath <filePath>", "The file that we should attempt to load from.")
        .option("-s, --skip-header", "Indicates that the file has a header row that should be skipped.", true)
        .option("-d --delimiter <delimiter>", "The delimiter character for the CSV. Defaults to ','.", ",")
        .option("-D, --debug", "Indicates that we should run the script in debug mode, which results in significantly more output ont he command line.", false)
        .parse(process.argv);

    // TODO: I should implement args for the following:
    //   - Option to load and process the data w/ a data stream instead of doing it asynchronously

    // Ensure that the user provided us with a file to read from.
    if (typeof programArgs.filePath == 'undefined' || programArgs.filePath === null || programArgs.filePath == "")
    {
        console.log("You must specify a file to read from using the '-f' argument.");
        console.log("See \"loadData -h\" for more details.");
        return;
    }

    // Get the mongoose models that we'll use to create MongoDB entries for what we read.
    var Sitter = mongoose.model("Sitter");
    var Stay = mongoose.model("Stay");
    var Owner = mongoose.model("Owner");

    // Create the arrays that will hold our models.
    var rawData = []; // For holding all of the scraped data
    var scrapedData = []; // For holding a modeled version of the scraped data

    // Log that we're beginning the loading process.
    process.stdout.write("Loading data...");

    // TODO: Re-implement this as a streaming option for files that are too large to be loaded into memory all at once.
    // Read the raw data
    rawData = csvParser(fileStream.readFileSync(programArgs.filePath), { delimiter: programArgs.delimiter });

    // Remove the header row from the data set, if necessary.
    if (programArgs.skipHeader)
    {
        rawData.shift();
    }

    // Format the raw data into a parsed object that we can work with more easily.
    var counter = 0;
    rawData.forEach(function (line)
    {
        // Create a new 
        var review = new scrapedReview(
            line[0], // StayRating
            line[1], // SitterImage
            line[2], // StayEndDate
            line[3], // StayText
            line[4], // OwnerImage
            line[5], // StayDogs
            line[6], // SitterName
            line[7], // OwnerName
            line[8], // StayStartDate
            line[9], // SitterPhoneNumber
            line[10], // SitterEmailAddress
            line[11], // OwnerPhoneNumber
            line[12] // OwnerEmailAddress
        );

        scrapedData.push(review);

        if (programArgs.debug)
        {
            console.log("Review " + counter + ":");
            printReview(review);
            console.log("");
        }

        counter++;
    });

    // Inform the user how many records we loaded.
    console.log(" Done.");
    console.log("Loaded " + rawData.length + " rows.\r\n");

    // Inform the user that we've starting to process the loaded data.
    process.stdout.write("Processing data...");

    // Create a set of arrays that will hold the distinct models that we'd like to create.
    var ownerData = [];
    var sitterData = [];
    var stayData = [];

    scrapedData.forEach(function (review)
    {
        // Create some objects that we'll use to store the matching models that we create and/or find.
        var thisOwner;
        var thisStay;
        var thisSitter;

        // Check to see if this review contains a new Owner.
        ownerData.forEach(function (owner)
        {
            if (owner.Name === review.OwnerName && owner.Image === review.OwnerImage && owner.PhoneNumber === review.OwnerPhoneNumber && owner.EmailAddress === review.OwnerEmailAddress)
            {
                thisOwner = owner;
                //break;
            }
        });

        // No matches were found, so we can add a new Owner.
        if (!thisOwner)
        {
            thisOwner = new Owner({
                Name: review.OwnerName,
                Image: review.OwnerImage,
                PhoneNumber: review.OwnerPhoneNumber,
                EmailAddress: review.OwnerEmailAddress
            });

            ownerData.push(thisOwner);
        }

        // Since every review represents a stay, we can always create a new Stay record.
        thisStay = new Stay({
            Dogs: review.StayDogs,
            StartDate: review.StayStartDate,
            EndDate: review.StayEndDate,
            ReviewText: review.StayText,
            Rating: review.StayRating,
            Owner: thisOwner.id
        });

        stayData.push(thisStay);

        // Check to see if this review contains a new Sitter.
        sitterData.forEach(function (sitter)
        {
            if (sitter.Name === review.SitterName && sitter.Image === review.SitterImage && sitter.PhoneNumber === review.SitterPhoneNumber && sitter.EmailAddress === review.SitterEmailAddress)
            {
                thisSitter = sitter;
                //sitter.Stays.push(thisStay.id);
                sitter.Stays.push(thisStay);
                //break;
            }
        });

        // No matches were found, so we can add a new Sitter.
        if (!thisSitter)
        {
            thisSitter = new Sitter({
                Name: review.SitterName,
                Image: review.SitterImage,
                PhoneNumber: review.SitterPhoneNumber,
                EmailAddress: review.SitterEmailAddress,
                Stays: [mongoose.Types.ObjectId(thisStay.id)]
            });

            sitterData.push(thisSitter);
        }
    });

    // TODO: As far as I can tell, there's no decent way to use RecalculateOverallSitterRank on the Sitter model to accomplish this because we already 
    // have a Sitter model and can't populate Stays manually, which we'd need to get their ranks to calculate the RatingsScore. Instead, I basically
    // have to re-implement ALL of the logic and pre-populate the OverallSitterRank and RatingsScore.

    // Manually calculate the new OverallSitterRanks.
    sitterData.forEach(function (sitter)
    {
        // Create an array of all of the ratings associated with this sitter.
        var sitterRatings = [];

        stayData.forEach(function (stay)
        {
            if (sitter.Stays.indexOf(stay.id) > -1)
            {
                sitterRatings.push(stay.Rating);
            }
        });

        var numberOfStays = sitterRatings.length;

        // Calculate the SitterScore
        var preparedName = sitter.Name.toLowerCase().replace(/[^a-z0-9]/gi, '');
        var uniqueChars = "";

        for (var i = 0; i < preparedName.length; i++)
        {
            if (uniqueChars.indexOf(preparedName[i]) == -1)
            {
                uniqueChars += preparedName[i];
            }
        }

        var sitterScore = uniqueChars.length / 26;

        var ratingsScore = 0;
        var totalRatings = 0;

        if (numberOfStays !== 0)
        {
            for (var i = 0; i < sitterRatings.length; i++)
            {
                totalRatings += sitterRatings[i];
            }

            ratingsScore = (totalRatings / numberOfStays);
        }

        // Set the RatingsScore.
        sitter.RatingsScore = ratingsScore;

        // If the sitter has no Stays, then the OverallSitterRank is just their SitterScore.
        if (sitterRatings.length < 1)
        {
            sitter.OverallSitterRank = sitterScore;
        }
        else
        {
            // Determine how much each rating should be weighted into the overall score.
            var sitterScoreWeight = (numberOfStays < 10 ? 1 - (numberOfStays / 10) : 0);
            var ratingsScoreWeight = (numberOfStays < 10 ? numberOfStays / 10 : 1);

            // Set the OverallSitterRank values.
            sitter.OverallSitterRank = (sitterScore * sitterScoreWeight) + (ratingsScore * ratingsScoreWeight);
        }
    });

    // Inform the user of how many owners, sitters, and stays we processed.
    if (programArgs.debug)
    {
        console.log("ownerData: " + ownerData);
        console.log("sitterData: " + sitterData);
        console.log("stayData: " + stayData);
    }

    console.log(" Done.");
    console.log("Found " + ownerData.length + " owners, " + sitterData.length + " sitters, and " + stayData.length + " stays.\r\n");

    //----------------------------------------------------------
    // Commit the collections we've built to the database.
    //----------------------------------------------------------

    // Connect to the local MongoDB instance so we can insert the data.
    // TODO: Change this to respect the process.env.NODE_ENV configuration.
    //mongoose.connect(config.mongoDbUrl);
    mongoose.connect("mongodb://localhost/RoverInterviewProject");

    // Commit owner data to MongoDB
    process.stdout.write("Saving owner data...");
    await saveOwnerData(Owner, ownerData)
        .catch(function (error)
        {
            console.log(error);
            return;
        });
    console.log(" Done.");

    // Commit stay data to MongoDB
    process.stdout.write("Saving stay data...");
    await saveStayData(Stay, stayData)
        .catch(function (error)
        {
            console.log(error);
            return;
        });
    console.log(" Done.");

    // Commit sitter data to MongoDB
    process.stdout.write("Saving sitter data...");
    await saveSitterData(Sitter, sitterData)
        .catch(function (error)
        {
            console.log(error);
            return;
        });
    console.log(" Done.");

    // Let the user know that we've done and exit/
    console.log("\r\nData load complete.\r\n");

    process.exit();
};

// Run our async function.
loadData();