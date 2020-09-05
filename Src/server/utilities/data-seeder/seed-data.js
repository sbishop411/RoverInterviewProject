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

	await Owner.create({
		Name: "Missy S.",
		Image: "http://placekitten.com/g/500/500?user=238",
		PhoneNumber: "+14341712430",
		EmailAddress: "user8802@t-mobile.com"
	});

	await Owner.create({
		Name: "David R.",
		Image: "http://placekitten.com/g/500/500?user=255",
		PhoneNumber: "+18470214729",
		EmailAddress: "user7116@verizon.net"
	});

	await Sitter.create({
		Name: "Jenny S.",
		Image: "http://placekitten.com/g/500/500?user=340",
		PhoneNumber: "+15583175693",
		EmailAddress: "user7736@t-mobile.com"
	});

	await saveModels(owners, Owner, "owner", "owners");
	await saveModels(sitters, Sitter, "sitter", "sitters");

	await saveStays(stays);
	//await saveModels(stays, Stay, "stay", "stays");
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

var saveModels = async function (modelsToSave, mongooseModel, singularName, pluralName)
{
	process.stdout.write(`Saving ${singularName} data`.padEnd(34, ".") + " ");

	let skippedCount = 0;
	let skippedModels = [];
	let addedCount = 0;

	for (const model of modelsToSave)
	{
		let searchResult;

		try
		{
			searchResult = await mongooseModel.find(model.getIdentityQuery()).limit(1).exec();
		}
		catch (error)
		{
			console.log(`An error occurred while searching for a ${singularName}:`);
			console.log(model.toString());
			console.log(`addedCount: ${addedCount}`);
			console.log(`skippedCount: ${skippedCount}`);
			console.log(error);
			process.exit(1);
		}

		if (searchResult.length === 0)
		{
			try
			{
				await mongooseModel.create(model);
				addedCount++;
			}
			catch (error)
			{
				console.log(`An error occurred while attempting to add the following ${singularName}:`);
				console.log(model.toString());
				console.log(`addedCount: ${addedCount}`);
				console.log(`skippedCount: ${skippedCount}`);
				console.log(error);
				process.exit(1);
			}
		}
		else
		{
			skippedModels.push(model);
			skippedCount++;
		}
	}

	if (skippedCount === 0)
	{
		console.log(chalk.green("done.") + ` Added ${addedCount} ${pluralName}.`);
	}
	else
	{
		console.log(chalk.green("done.") + ` Added ${addedCount} ${pluralName}. Skipped ${skippedCount} existing ${pluralName}:`);
		if (skippedCount < 10)
		{
			for (const skippedModel of skippedModels)
			{
				console.log("\t" + chalk.yellow("Skipped: ") + skippedModel.toString());
			}
		}
	}
}

var saveStays = async function (stays)
{
	process.stdout.write("Saving Stay data".padEnd(34, ".") + " ");
	await Stay.insertMany(stays);
	console.log(chalk.green("done."));
}
