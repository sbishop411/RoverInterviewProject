import path from "path";
import fs from "fs";
import csvParse from "csv-parse";
import chalk from "chalk";
import mongoose from "mongoose";
import { ScrapedReview } from "./scraped-review";
import { OwnerModel, SitterModel, StayModel } from "../../../shared/schemas";
import { Owner } from "../../../shared/entities/owner";
import { Sitter } from "../../../shared/entities/sitter";
import { Stay } from "../../../shared/entities/stay";

const pathToFile = "./data/";
const fileName = "reviews.csv";

export async function seedData()
{
	let reviews: ScrapedReview[] = await loadData();
	await saveData(reviews);
}

var loadData = async function ()
{
	process.stdout.write(`Loading data from \"${fileName}\"`.padEnd(60, ".") + " ");

	let loadedReviews: ScrapedReview[] = new Array<ScrapedReview>();

	try {
		const parser = fs.createReadStream(path.resolve(pathToFile, fileName))
			.pipe(csvParse({
				from_line: 2,
				delimiter: ','
			}));

		for await (const record of parser) {
			loadedReviews.push(new ScrapedReview(record));
		}
	} catch (e) {
		console.log(chalk.red("An issue while loading seed data:"));
		console.log(e);
		throw e;
	}

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

console.log("================================ Adding Records ================================");
let counter: number = 0;
	
	// TODO: Is there any way we can improve the type safety of 'review' in this for...of loop?
	for (let review of reviews)
	{
console.log(`Working on review ${counter}.` + ` Owner: ${review.ownerName}`.padEnd(20) + `Sitter: ${review.sitterName}`.padEnd(20));
		let ownerForStay: Owner;
		let sitterForStay: Sitter;

try {
console.log(`____Attempting to find Owner ${review.ownerName}.`);
		let ownerSearchResult: Owner | null = await OwnerModel.findOne({
			fullName: review.ownerName,
			phoneNumber: review.ownerPhoneNumber,
			emailAddress: review.ownerEmailAddress
		}).exec();

		if (ownerSearchResult === undefined || ownerSearchResult === null)
		{
console.log(`____Unable to find Owner ${review.ownerName}, adding.`);
			ownerForStay = await OwnerModel.create({
				fullName: review.ownerName,
				phoneNumber: review.ownerPhoneNumber,
				emailAddress: review.ownerEmailAddress,
				image: review.ownerImage,
			});

			ownerAddedCount++;
		} else {
console.log(`____Found Owner ${review.ownerName}, will add this stay to them in a moment.`);
			ownerForStay = ownerSearchResult;
			ownerSkippedCount++;
		}


} catch (e) {
	console.log(chalk.red("An issue occurred while adding an owner:"));
	console.log(e);
	throw e;
}

try {
console.log(`____Attempting to find Sitter ${review.sitterName}.`);
		let sitterSearchResult: Sitter | null = await SitterModel.findOne({
			fullName: review.sitterName,
			phoneNumber: review.sitterPhoneNumber,
			emailAddress: review.sitterEmailAddress
		}).exec();

		if (sitterSearchResult === undefined || sitterSearchResult === null)
		{
console.log(`____Unable to find Sitter ${review.sitterName}, adding.`);

			sitterForStay = await SitterModel.create({
				fullName: review.sitterName,
				phoneNumber: review.sitterPhoneNumber,
				emailAddress: review.sitterEmailAddress,
				image: review.sitterImage,
				stays: []
			});


			sitterAddedCount++;
		} else {
console.log(`____Found Sitter ${review.sitterName}, will add this stay to them in a moment.`);
			sitterForStay = sitterSearchResult;
			sitterSkippedCount++;
		}
} catch (e) {
	console.log(chalk.red("An issue occurred while adding a sitter:"));
	console.log(e);
	throw e;
}

try {
console.log(`____Attempting to find Stay ${counter}.`);
		let staySearchResult: Stay | null = await StayModel.findOne({
			owner: ownerForStay.id,
			sitter: sitterForStay.id,
			dogs: review.stayDogs,
			startDate: review.stayStartDate,
			endDate: review.stayEndDate,
			reviewText: review.stayReviewText,
			rating: review.stayRating
		}).exec();

		if (staySearchResult === undefined || staySearchResult === null)
		{
console.log(`____Unable to find Stay ${counter}, adding.`);
			let newStay = await StayModel.create({
				owner: ownerForStay,
				sitter: sitterForStay.id as mongoose.Types.ObjectId,
				dogs: review.stayDogs,
				startDate: review.stayStartDate,
				endDate: review.stayEndDate,
				reviewText: review.stayReviewText,
				rating: review.stayRating,
			});

console.log(`____Pushing stay ${counter} onto Owner ${review.ownerName}.`);
			ownerForStay.addStay(newStay);
console.log(`____Saving updated document for ${review.ownerName}.`);
			await OwnerModel.findByIdAndUpdate(ownerForStay.id, ownerForStay);

//console.log(`____Pushing stay ${counter} onto Sitter ${review.sitterName}.`);
			//sitterForStay.addStay(newStay);
//console.log(`____Saving updated document for ${review.sitterName}.`);
//			await SitterModel.findByIdAndUpdate(sitterForStay.id, sitterForStay);

			stayAddedCount++;
		}
		else
		{
console.log(`____Found Stay ${counter}, skipping add.`);
			staySkippedCount++;
		}
} catch (e) {
	console.log(chalk.red("An issue occurred while adding a stay:"));
	console.log(e);
	throw e;
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
