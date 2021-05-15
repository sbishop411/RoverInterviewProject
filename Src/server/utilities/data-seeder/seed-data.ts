import fs from "fs";
import csvParse from "csv-parse";
import chalk from "chalk";
import { getModelForClass } from "@typegoose/typegoose";
import { ScrapedReview } from "./scraped-review";
import { Owner } from "../../../shared/classes/owner";
import { Sitter } from "../../../shared/classes/sitter";
import { Stay } from "../../../shared/classes/stay";
const Owners = getModelForClass(Owner);
const Sitters = getModelForClass(Sitter);
const Stays = getModelForClass(Stay);

const pathToFile = "./data/";
const fileName = "reviews.csv";

export async function seedData()
{
	let reviews: ScrapedReview[] = await loadData();
	await saveData(reviews);
}

var loadData = async function ()
{
	let streamPromise = new Promise<ScrapedReview[]>((resolve, reject) =>
	{
		//let scrapedReviews = [];
		let scrapedReviews: ScrapedReview[] = new Array();

		fs.createReadStream(pathToFile + fileName)
			.pipe(csvParse({ from_line: 2 }))
			.on("data", (row) => scrapedReviews.push(new ScrapedReview(row)))
			.on("end", () => resolve(scrapedReviews))
			.on("error", error => reject(error));
	});

	process.stdout.write(`Loading data from \"${fileName}\"`.padEnd(60, ".") + " ");
	let loadedReviews: ScrapedReview[] = await streamPromise;
	console.log(chalk.green(" done.") + ` Found and loaded ${loadedReviews.length} reviews.`);
	return loadedReviews;
}

var saveData = async function (reviews: ScrapedReview[])
{
	process.stdout.write("Saving data to MongoDB".padEnd(60, ".") + " ");
	
	let ownerAddedCount: number = 0;
	let sitterAddedCount: number = 0;
	let stayAddedCount: number = 0;
	let ownerSkippedCount: number = 0;
	let sitterSkippedCount: number = 0;
	let staySkippedCount: number = 0;

	// TODO: Is there any way we can use a type with this for...of?
	for (let review of reviews)
	{
		let ownerSearchResult = await Owners.findOne().findMatching(review.owner).exec();
		let sitterSearchResult = await Sitters.findOne().findMatching(review.sitter).exec();
	
		if (ownerSearchResult === null)
		{
			let createdOwner = await Owners.create({
				Name: review.owner.name,
				PhoneNumber: review.owner.phoneNumber,
				EmailAddress: review.owner.emailAddress,
				Image: review.owner.image
			});

			review.stay.owner = createdOwner._id;  // THIS MIGHT BE WRONG
			ownerAddedCount++;
		}
		else
		{
			review.stay.owner = ownerSearchResult._id;  // THIS MIGHT BE WRONG
			ownerSkippedCount++;
		}

		if (sitterSearchResult === null)
		{
			let createdSitter = await Sitters.create({
				name: review.sitter.name,
				phoneNumber: review.sitter.phoneNumber,
				emailAddress: review.sitter.emailAddress,
				image: review.sitter.image
			});

			review.stay.sitter = createdSitter._id;  // THIS MIGHT BE WRONG
			sitterAddedCount++;
		}
		else
		{
			review.stay.sitter = sitterSearchResult._id;  // THIS MIGHT BE WRONG
			sitterSkippedCount++;
		}

		// THIS IS NO LONGER WORKING, WE'RE CREATING DUPLICATE STAYS
		//let staySearchResult = await StaySchema.findOne().findMatching(review.stay).exec();
		let staySearchResult = await Stays.find().findMatching(review.stay).exec();       // This ought to use the 'findMatching' query we created on the Stay class.

		if (staySearchResult === null)
		{
			await Stays.create({
				owner: review.stay.owner,
				sitter: review.stay.sitter,
				dogs: review.stay.dogs,
				startDate: review.stay.startDate,
				endDate: review.stay.endDate,
				reviewText: review.stay.reviewText,
				rating: review.stay.rating
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
