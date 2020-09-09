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
	await saveData(reviews);
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

var saveData = async function (reviews)
{
	process.stdout.write("Saving data to MongoDB".padEnd(34, ".") + " ");
	
	let ownerAddedCount = 0;
	let sitterAddedCount = 0;
	let stayAddedCount = 0;
	let ownerSkippedCount = 0;
	let sitterSkippedCount = 0;
	let staySkippedCount = 0;

	for (let review of reviews)
	{
		let ownerSearchResult = await Owner.findOne().findMatching(review.Owner).exec();
		let sitterSearchResult = await Sitter.findOne().findMatching(review.Sitter).exec();
	
		if (ownerSearchResult === null)
		{
			let createdOwner = await Owner.create({
				Name: review.Owner.Name,
				PhoneNumber: review.Owner.PhoneNumber,
				EmailAddress: review.Owner.EmailAddress,
				Image: review.Owner.Image
			});

			review.Stay.OwnerId = createdOwner._id;
			ownerAddedCount++;
		}
		else
		{
			review.Stay.OwnerId = ownerSearchResult._id;
			ownerSkippedCount++;
		}

		if (sitterSearchResult === null)
		{
			let createdSitter = await Sitter.create({
				Name: review.Sitter.Name,
				PhoneNumber: review.Sitter.PhoneNumber,
				EmailAddress: review.Sitter.EmailAddress,
				Image: review.Sitter.Image
			});

			review.Stay.SitterId = createdSitter._id;
			sitterAddedCount++;
		}
		else
		{
			review.Stay.SitterId = sitterSearchResult._id;
			sitterSkippedCount++;
		}

		let staySearchResult = await Stay.findOne().findMatching(review.Stay).exec();

		if (staySearchResult === null)
		{
			await Stay.create({
				Owner: review.Stay.OwnerId,
				Sitter: review.Stay.SitterId,
				Dogs: review.Stay.Dogs,
				StartDate: review.Stay.StartDate,
				EndDate: review.Stay.EndDate,
				ReviewText: review.Stay.ReviewText,
				Rating: review.Stay.Rating
			});

			stayAddedCount++;
		}
		else
		{
			staySkippedCount++;
		}
	}
	
	console.log(chalk.green("done.") + " Results:");
	console.table({
		Owners: {
			Added: ownerAddedCount,
			Skipped: ownerSkippedCount
		},
		Sitters: {
			Added: sitterAddedCount,
			Skipped: sitterSkippedCount
		},
		Stays: {
			Added: stayAddedCount,
			Skipped: staySkippedCount
		}
	});
}
