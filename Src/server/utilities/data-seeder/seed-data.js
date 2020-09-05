const fs = require("fs");
const csvParse = require("csv-parse");
const chalk = require("chalk");
const ScrapedReview = require("./scraped-review");
const Sitter = require("../../models/Sitter");
const Owner = require("../../models/Owner");
const Stay = require("../../models/Stay");

const pathToFile = "./data/";
const fileName = "reviews.csv";

module.exports = async function ()
{
	let reviews = await loadData();

	let { owners, sitters, stays } = await normalizeData(reviews);

	await saveOwners(owners);
	await saveSitters(sitters);
	await saveStays(stays);
}

var loadData = async function ()
{
	let streamPromise = new Promise((resolve, reject) =>
	{
		let scrapedReviews = [];

		fs.createReadStream(pathToFile + fileName)
			.pipe(csvParse({ from_line: 2 }))
			.on("data", (row) => scrapedReviews.push(new ScrapedReview(row)))
			.on("end", () => resolve(scrapedReviews))
			.on("error", error => reject(error));
	});

	process.stdout.write(`Loading data from \"${fileName}\"`.padEnd(34, ".") + " ");
	let loadedReviews = await streamPromise;
	console.log(chalk.green(" done.") + ` Found and loaded ${loadedReviews.length} reviews.`);
	return loadedReviews;
}

var normalizeData = async function (reviews)
{
	process.stdout.write(`Normalizing ${reviews.length} reviews`.padEnd(34, ".") + " ");

	let owners = [];
	let stays = [];
	let sitters = [];

	await reviews.forEach((review) => 
	{
		let newOwner = new Owner({
			Name: review.OwnerName,
			Image: review.OwnerImage,
			PhoneNumber: review.OwnerPhoneNumber,
			EmailAddress: review.OwnerEmailAddress
		});

		let newSitter = new Sitter({
			Name: review.SitterName,
			Image: review.SitterImage,
			PhoneNumber: review.SitterPhoneNumber,
			EmailAddress: review.SitterEmailAddress
		});

		let newStay = new Stay({
			Dogs: review.StayDogs,
			StartDate: review.StayStartDate,
			EndDate: review.StayEndDate,
			ReviewText: review.StayText,
			Rating: review.StayRating,
			Owner: newOwner,
			Sitter: newSitter
		});

		let existingOwner = owners.find((listOwner) => listOwner.equals(newOwner));
		if (existingOwner != null)
		{
			existingOwner.Stays.push(newStay);
		}
		else
		{
			newOwner.Stays.push(newStay);
			owners.push(newOwner);
		}

		let existingSitter = sitters.find((listSitter) => listSitter.equals(newSitter));
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

	// The RatingsScore and OverallSitterRank need to be recalculated here 
	sitters.forEach((sitter) => sitter.RecalculateRanks());

	console.log(chalk.green(" done.") + ` Found ${owners.length} Owners, ${sitters.length} Sitters, and ${stays.length} Stays.`);

	return {
		owners: owners,
		sitters: sitters,
		stays: stays
	}
}

// TODO: For each of these, we should check to see if the database already contains each record, and only insert if necessary.
var saveOwners = async function (owners)
{
	
	process.stdout.write("Saving owner data".padEnd(34, ".") + " ");
	await Owner.insertMany(owners);
	console.log(chalk.green("done."));
}

var saveSitters = async function (sitters)
{
	process.stdout.write("Saving Sitter data".padEnd(34, ".") + " ");
	await Sitter.insertMany(sitters);
	console.log(chalk.green("done."));
}

var saveStays = async function (stays)
{
	process.stdout.write("Saving Stay data".padEnd(34, ".") + " ");
	await Stay.insertMany(stays);
	console.log(chalk.green("done."));
}
