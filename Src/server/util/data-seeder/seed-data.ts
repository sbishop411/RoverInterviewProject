import path from "path";
import fs from "fs";
import csvParse from "csv-parse";
import chalk from "chalk";
import { ScrapedReview } from "./scraped-review";
import { OwnerSchema as Owners, SitterSchema as Sitters, StaySchema as Stays } from "../../../shared/schemas";
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

	// TODO: Is there any way we can improve the type safety of 'review' in this for...of loop?
	for (let review of reviews)
	{
		let ownerSearchResult: Owner = await Owners.find().findMatching(review.owner).exec() as Owner;
		let sitterSearchResult: Sitter = await Sitters.find().findMatching(review.sitter).exec() as Sitter;
	
		if (ownerSearchResult === undefined || ownerSearchResult === null)
		{
			let createdOwner: Owner = await Owners.create({
				name: review.owner.name,
				phoneNumber: review.owner.phoneNumber,
				emailAddress: review.owner.emailAddress,
				image: review.owner.image
			});

			review.stay.owner = createdOwner;
			ownerAddedCount++;
		} else {
			review.stay.owner = ownerSearchResult;
			ownerSkippedCount++;
		}

		if (sitterSearchResult === undefined || sitterSearchResult === null)
		{
			let createdSitter: Sitter = await Sitters.create({
				name: review.sitter.name,
				phoneNumber: review.sitter.phoneNumber,
				emailAddress: review.sitter.emailAddress,
				image: review.sitter.image
			});

			review.stay.sitter = createdSitter;
			sitterAddedCount++;
		} else {
			review.stay.sitter = sitterSearchResult;
			sitterSkippedCount++;
		}

		let staySearchResult: Stay = await Stays.find().findMatching(review.stay).exec() as Stay;

		if (staySearchResult === undefined || staySearchResult === null)
		{
			let newStay: Stay = await Stays.create({
				owner: review.stay.owner,
				sitter: review.stay.sitter,
				dogs: review.stay.dogs,
				startDate: review.stay.startDate,
				endDate: review.stay.endDate,
				reviewText: review.stay.reviewText,
				rating: review.stay.rating
			});

			// Add a reference to the newly created Stay the the associated Owner and Sitter.
			// TODO: Determine if it's possible to accomplish this through pre- and post-hooks on the Stay model.
			await Owners.findByIdAndUpdate(review.stay.owner.id, { $push: { _stays: newStay.id } });
			await Sitters.findByIdAndUpdate(review.stay.sitter.id, { $push: { _stays: newStay.id } });

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
