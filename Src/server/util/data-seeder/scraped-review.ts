//import { Owner } from "../../../shared/entities/owner";
//import { Sitter } from "../../../shared/entities/sitter";
//import { Stay } from "../../../shared/entities/stay";
//import { OwnerModel, SitterModel, StayModel } from "../../../shared/schemas";

export class ScrapedReview
{
	public ownerName: string;
	public ownerImage: string;
	public ownerPhoneNumber: string;
	public ownerEmailAddress: string;

	public sitterName: string;
	public sitterImage: string;
	public sitterPhoneNumber: string;
	public sitterEmailAddress: string;

	public stayDogs: string;
	public stayStartDate: Date;
	public stayEndDate: Date;
	public stayReviewText: string;
	public stayRating: number;

	constructor(csvLine: string)
	{
		this.ownerName = csvLine[7].trim();
		this.ownerImage = csvLine[4].trim();
		this.ownerPhoneNumber = csvLine[11].trim();
		this.ownerEmailAddress = csvLine[12].trim();

		this.sitterName = csvLine[6].trim()
		this.sitterImage = csvLine[1].trim()
		this.sitterPhoneNumber = csvLine[9].trim()
		this.sitterEmailAddress = csvLine[10].trim()

		this.stayDogs = csvLine[5].trim();
		this.stayStartDate = new Date(csvLine[8].trim());
		this.stayEndDate = new Date(csvLine[2].trim())
		this.stayReviewText = csvLine[3].trim();
		this.stayRating = parseInt(csvLine[0].trim());
	}



	//owner: Owner;
	//sitter: Sitter;
	//stay: Stay;


	//owner: typeof OwnerModel;
	//sitter: typeof SitterModel;
	//stay: typeof StaySchema;
	
	// CSV file column order:
	//  5 - dogs,
	//  8 - start_date,
	//  2 - end_date,
	//  3 - text,
	//  0 - rating,

	//  6 - sitter,
	//  1 - sitter_image,
	//  9 - sitter_phone_number,
	// 10 - sitter_email,

	//  7 - owner,
	//  4 - owner_image,
	// 11 - owner_phone_number,
	// 12 - owner_email

	/*
	constructor(csvLine: string)
	{
		
		// Wouldn't named constructor parameters be nice?
		//this.owner = new Owner(csvLine[7].trim(), csvLine[4].trim(), csvLine[11].trim(), csvLine[12].trim());
		//this.sitter = new Sitter(csvLine[6].trim(), csvLine[1].trim(), csvLine[9].trim(), csvLine[10].trim());
		//this.stay = new Stay(this.owner, this.sitter, csvLine[5].trim(), new Date(csvLine[8].trim()), new Date(csvLine[2].trim()), csvLine[3].trim(), parseInt(csvLine[0].trim()));


		this.owner = new Owner(csvLine[7].trim(), csvLine[4].trim(), csvLine[11].trim(), csvLine[12].trim());
		this.sitter = new Sitter(csvLine[6].trim(), csvLine[1].trim(), csvLine[9].trim(), csvLine[10].trim());
		this.stay = new Stay(this.owner, this.sitter, csvLine[5].trim(), new Date(csvLine[8].trim()), new Date(csvLine[2].trim()), csvLine[3].trim(), parseInt(csvLine[0].trim()));


		this.owner.addStay(this.stay);
		this.sitter.addStay(this.stay);
	}
	*/
}
