const fs = require("fs");
const csvParse = require("csv-parse");
const ScrapedReview = require("./scraped-review");
const Sitter = require("../../models/Sitter");
const Owner = require("../../models/Owner");
const Stay = require("../../models/Stay");

const pathToFile = "./data/reviews.csv";

module.exports.seedData = async function ()
{
	var reviews = await loadData();
	await saveData(reviews);
}

var loadData = async function ()
{
	console.log(`Loading data from "${pathToFile}"...`);

	// Promises suck. I should figure out how to implement this using async/await.
	return new Promise((resolve, reject) =>
	{
		var scrapedReviews = [];
		
		fs.createReadStream(pathToFile)
			.pipe(csvParse({ from_line: 2 }))
			.on("data", function (row)
			{
				scrapedReviews.push(new ScrapedReview(row));
			})
			.on("end", async () =>
			{
				console.log(`Found and loaded ${scrapedReviews.length} reviews.`);
				resolve(scrapedReviews);
			});
	});
}

var saveData = async function (reviews)
{
	console.log(`Normalizing ${reviews.length} reviews...`);

	var owners = [];
	var stays = [];
	var sitters = [];

	// Normalize the scraped data
	await reviews.forEach((review) => 
	{
	
		var newOwner = new Owner({
			Name: review.OwnerName,
			Image: review.OwnerImage,
			PhoneNumber: review.OwnerPhoneNumber,
			EmailAddress: review.OwnerEmailAddress
		});

		var newSitter = new Sitter({
			Name: review.SitterName,
			Image: review.SitterImage,
			PhoneNumber: review.SitterPhoneNumber,
			EmailAddress: review.SitterEmailAddress
		});

		var newStay = new Stay({
			Dogs: review.StayDogs,
			StartDate: review.StayStartDate,
			EndDate: review.StayEndDate,
			ReviewText: review.StayText,
			Rating: review.StayRating,
			Owner: newOwner,
			Sitter: newSitter
		});

		var existingOwner = owners.find((listOwner) => listOwner.equals(newOwner));
		if (existingOwner != null)
		{
			existingOwner.Stays.push(newStay);
		}
		else
		{
			newOwner.Stays.push(newStay);
			owners.push(newOwner);
		}

		var existingSitter = sitters.find((listSitter) => listSitter.equals(newSitter));
		if (existingSitter != null)
		{
			existingSitter.Stays.push(newStay);
		}
		else
		{
			newSitter.Stays.push(newStay);
			sitters.push(newSitter);
		}

		stays.push(newStay);
	});

	// TODO: Sitters aren't having their OverallSitterRank or RatingsScore populated.

	console.log(`Normalization complete. Found ${owners.length} Owners, ${sitters.length} Sitters, and ${stays.length} Stays.`);

	// Save the data that we normalized.
	console.log("Saving owner data...");
	await Owner.insertMany(owners);
	console.log("Done.");

	console.log("Saving Sitter data...");
	await Sitter.insertMany(sitters);
	console.log("Done.");

	console.log("Saving Stay data...");
	await Stay.insertMany(stays);
	console.log("Done.");
}
