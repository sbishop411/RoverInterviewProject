import { prop, pre, queryMethod, Ref, ReturnModelType, modelOptions } from "@typegoose/typegoose";
import { AsQueryMethod } from "@typegoose/typegoose/lib/types";
import { SitterModel, StayModel } from "../schemas";
import { BaseEntity } from "./baseEntity";
import { Stay } from "./stay";

// TODO: There's an absolutely ridiculous amount of duplicated code in here revolving around updating the _ratingsScore and _overallSitterRank.
// Mongoose is utter crap, so it may actually be impossible for us to abstract this away. I've done the best I can with the getRatingsScore()
// and getOverallSitterRank() static methods, but even the data we pass into them is garbage in most cases.
interface QueryHelpers {
	findMatching: AsQueryMethod<typeof findMatching>;
}

function findByName(this: ReturnModelType<typeof Sitter, QueryHelpers>, name: string) {
	return this.findOne({
        fullName: name
    }).populate({ path: "stays", model: Stay })
	.populate("sitterScore")
	.populate("ratingsScore")
	.populate("overallSitterRank");
	// TODO: When we include the call to .populate(), we get the error "Schema hasn't been registered for model 'Stay'.", though I'm not sure why. I've create issue #29 to resolve this.
}

function findMatching(this: ReturnModelType<typeof Sitter, QueryHelpers>, other: Sitter) {
	return this.findOne({
        fullName: other.fullName,
        phoneNumber: other.phoneNumber,
        emailAddress: other.emailAddress,
        image: other.image
    }).populate({ path: "stays", model: Stay })
	.populate("sitterScore")
	.populate("ratingsScore")
	.populate("overallSitterRank");
}

@queryMethod(findByName)
@queryMethod(findMatching)
@modelOptions({
	schemaOptions: {
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
})
/*
@pre<Sitter>("save", async function(this: Sitter, next: any) {
console.log("=====pre-save middleware triggered.");
	// The _stays for this sitter aren't populated(), so we need to do so manually to ensure accuracy. Mongoose sucks a LOT.
	
	if(this._stays === undefined || this._stays === null || this._stays.length < 1 ) {
		this._stays = await StayModel.find({ sitter: this.id }).exec();
	}

	this._ratingsScore = Sitter.getRatingsScoreFromSitter(this);
	this._overallSitterRank = Sitter.getOverallSitterRankFromSitter(this);
	next();
})
@pre<Sitter>("update", async function(next: any) {

	console.log("=====pre-findOneandUpdate middleware triggered.");
	console.log(`-----typeof this.getUpdate()._update: ${typeof this.getUpdate()._update}`);
	console.log(`-----this.getUpdate()._update: ${this.getUpdate()._update}`);
	console.log(`-----(await this).id: ${(await this).id}`);
	console.log(`-----this.getFilter()._id: ${this.getFilter()._id}`);
	console.log(`-----this.getFilter().name: ${this.getFilter().name}`);
	console.log(`-----this.getUpdate()._id: ${this.getUpdate()._id}`);
	console.log(`-----this.getUpdate().name: ${this.getUpdate().name}`);
		
		
		let thisSitter: Sitter | null;
	
		if (this.getFilter()._id !== undefined && this.getFilter()._id !== null ) {
			thisSitter = await SitterModel.findById(this.getFilter()._id).populate("_stays").exec();
		} else if (this.getFilter().name !== undefined && this.getFilter().name !== null) {
			thisSitter = await SitterModel.findOne({ name: this.getFilter().name }).populate("_stays").exec();
		} else {
			thisSitter = null;
		}
	
		if (thisSitter === null) {
			console.log("*****In findOneAndUpdate middleware, but neither _id or name were used in the query.");
			next();
		} else {
			let newRatingsScore: number = Sitter.getRatingsScore(thisSitter.stays);
			this.getUpdate()._update.$set._ratingsScore = Sitter.getRatingsScore(thisSitter.stays);
			this.getUpdate()._update.$set._overallSitterRank = Sitter.getOverallSitterRank(thisSitter.stays, SitterModel.getSitterScoreFromName(thisSitter.fullName), newRatingsScore);
			next();
		}



})
// These next two should be identical since you can't access the document being updated in either.
@pre<Sitter>("updateOne", async function(this: mongoose.Query<any>, next: any) {

	console.log("=====pre-findOneandUpdate middleware triggered.");
	console.log(`-----typeof this.getUpdate()._update: ${typeof this.getUpdate()._update}`);
	console.log(`-----this.getUpdate()._update: ${this.getUpdate()._update}`);
	console.log(`-----(await this).id: ${(await this).id}`);
	console.log(`-----this.getFilter()._id: ${this.getFilter()._id}`);
	console.log(`-----this.getFilter().name: ${this.getFilter().name}`);
	console.log(`-----this.getUpdate()._id: ${this.getUpdate()._id}`);
	console.log(`-----this.getUpdate().name: ${this.getUpdate().name}`);
		
		
		let thisSitter: Sitter | null;
	
		if (this.getFilter()._id !== undefined && this.getFilter()._id !== null ) {
			thisSitter = await SitterModel.findById(this.getFilter()._id).populate("_stays").exec();
		} else if (this.getFilter().name !== undefined && this.getFilter().name !== null) {
			thisSitter = await SitterModel.findOne({ name: this.getFilter().name }).populate("_stays").exec();
		} else {
			thisSitter = null;
		}
	
		if (thisSitter === null) {
			console.log("*****In findOneAndUpdate middleware, but neither _id or name were used in the query.");
			next();
		} else {
			let newRatingsScore: number = Sitter.getRatingsScore(thisSitter.stays);
			this.getUpdate()._update.$set._ratingsScore = Sitter.getRatingsScore(thisSitter.stays);
			this.getUpdate()._update.$set._overallSitterRank = Sitter.getOverallSitterRank(thisSitter.stays, SitterModel.getSitterScoreFromName(thisSitter.fullName), newRatingsScore);
			next();
		}

})
@pre<Sitter>("findOneAndUpdate", async function(next: any) {
console.log("=====pre-findOneandUpdate middleware triggered.");
	let updateDoc = this.getUpdate();
	let filter = this.getFilter();
console.log(`-----filter._id: ${filter._id}`);
console.log(`-----filter.name: ${filter.name}`);

	let thisSitter: mongoose.Document | null

try {

	if (filter._id !== undefined && filter._id !== null ) {
		thisSitter = await SitterModel.findById(filter._id).populate("_stays").exec();
	} else if (filter.name !== undefined && filter.name !== null) {
		thisSitter = await SitterModel.findOne({ name: filter.name }).populate("_stays").exec();
	} else {
		thisSitter = null;
	}

 


} catch (e) {
	console.log("+++++Issue in findOneAndUpdate while searching for sitter matching the query filter.");
	console.log(e);
	throw e;
}



	if (thisSitter === null) {
		console.log("*****In findOneAndUpdate middleware, but neither _id or name were used in the query.");
		next();
	} else {
		
try {
		let newRatingsScore: number = Sitter.getRatingsScore(thisSitter.stays);
		updateDoc._update.$set._ratingsScore = Sitter.getRatingsScore(thisSitter.stays);
		updateDoc._update.$set._overallSitterRank = Sitter.getOverallSitterRank(thisSitter.stays, SitterModel.getSitterScoreFromName(thisSitter.fullName), newRatingsScore);

} catch (e) {
	console.log("+++++Issue in findOneAndUpdate while getting new values.");
	console.log(e);
	throw e;
}

		next();
	}
})
*/
export class Sitter extends BaseEntity {
	@prop({
		required: [true, "The sitter must have a name."],
		trim: true,
	})
	public fullName: string;

	@prop({
		required: false,
		trim: true,
	})
	public image: string;

	@prop({
		required: [true, "The sitter must have a phone number."],
		trim: true,
	})
	public phoneNumber: string;

	@prop({
		required: [true, "The sitter must have a unique email address."],
		unique: true,
		trim: true,
	})
	public emailAddress: string;

/*
	@prop({
		required: false,
		ref: () => Stay,
		default: new Array<Stay>()
	})
	private _stays: Array<Ref<Stay>>;
*/

	@prop({
		ref: () => Stay,
		foreignField: 'sitter', // compare this value to the local document populate is called on
		localField: '_id' // compare this to the foreign document's value defined in "foreignField"
	})
	public stays: Ref<Stay>[] = new Array<Ref<Stay>>();

	/*
	get stays(): Array<Ref<Stay>> {
		return this._stays;
	}*/

	public get sitterScore(): number {
		let preparedName: string = this.fullName ? this.fullName.toLowerCase().replace(/[^a-z0-9]/gi, "") : "";
		let uniqueLetterCount: number = new Set(preparedName.split("")).size;
		return (uniqueLetterCount / 26) * 5;
	}

	public get ratingsScore(): number {
		if(this.stays === undefined || this.stays === null || this.stays.length < 1) {
			return 0;
		} else {
			let ratingsSum: number = this.stays
				.map(stay => (stay as Stay).rating)         // TODO: We need to somehow resolve this Ref<Stay, ObjectId> into the actual Stay itself. What gives?
				.reduce((runningTotal, rating) => (runningTotal + rating));
			
			return (ratingsSum / this.stays.length);
		}
	}

	public get overallSitterRank(): number {
		if (this.stays.length < 1)
		{
			return this.sitterScore;
		}
		else
		{
			let ratingWeight = this.stays.length < 10 ? (this.stays.length / 10) : 1;
			return (this.sitterScore * (1 - ratingWeight)) + (this.ratingsScore * ratingWeight);
		}
	}

	

	

	constructor(name: string, image: string, phoneNumber: string, emailAddress: string/*, stays?: Ref<Stay>[]*/) {
		super();

		this.fullName = name;
		this.image = image;
		this.phoneNumber = phoneNumber;
		this.emailAddress = emailAddress;
		//this.stays = (stays === undefined || stays === null) ? new Array() : stays;
	}

	/*
	public recalculateScores(): void {
		
		console.log(`Recalculating sitter scores for ${this.name}`);
		
		let newRatingsScore = Sitter.getRatingsScore(this);
		console.log(`____Old Ratings Score: ${this._ratingsScore}`);
		console.log(`____New Ratings Score: ${newRatingsScore}`);
		this._ratingsScore = newRatingsScore;

		//let newOverallSitterRank = this.getOverallSitterRank();
		let newOverallSitterRank = Sitter.getOverallSitterRank(this);
		console.log(`____Old Sitter Rank: ${this._overallSitterRank}`);
		console.log(`____New Sitter Rank: ${newOverallSitterRank}`);
		this._overallSitterRank = newOverallSitterRank;
	}
	*/
	
	//static getRatingsScore(stays: Stay[] = []): number {


	/*
	static getSitterScoreFromName(name: string) {
		let preparedName: string = name.toLowerCase().replace(/[^a-z0-9]/gi, "");
		let uniqueLetterCount: number = new Set(preparedName.split("")).size;
		return (uniqueLetterCount / 26) * 5;
	}

	static getRatingsScore(stays: Ref<Stay, mongoose.Types.ObjectId | undefined>[]): number {	
		if(stays === undefined || stays === null || stays.length < 1) {
			return 0;
		} else {
			let ratingsSum: number = stays
				.map(stay => (stay as Stay).rating)         // TODO: We need to somehow resolve this Ref<Stay, ObjectId> into the actual Stay itself. What gives?
				.reduce((runningTotal, rating) => (runningTotal + rating));
			
			return (ratingsSum / stays.length);
		}
	}
	
	static getRatingsScoreFromSitter(sitter: Sitter): number {
		return SitterModel.getRatingsScore(sitter._stays);
	}

	static getOverallSitterRank(stays: Ref<Stay, mongoose.Types.ObjectId | undefined>[], sitterScore: number, ratingsScore: number): number {
		// If the sitter has no Stays, then the OverallSitterRank is just their SitterScore.
		if (stays === undefined || stays === null || stays.length < 1)
		{
			return sitterScore;
		}
		else
		{
			let ratingWeight = stays.length < 10 ? (stays.length / 10) : 1;
			return (sitterScore * (1 - ratingWeight)) + (ratingsScore * ratingWeight);
		}
	}

	static getOverallSitterRankFromSitter(sitter: Sitter): number {
		return SitterModel.getOverallSitterRank(sitter._stays, sitter.sitterScore, sitter._ratingsScore);
	}
	*/
	

	/*
	// TODO: Maybe change the return type of this to boolean to return success/fail information.
	addStay(stay: Stay): void
	{
		this._stays.push(stay);
		//this._ratingsScore = Sitter.getRatingsScoreFromSitter(this);
		//this._overallSitterRank = Sitter.getOverallSitterRankFromSitter(this);
	}

	//TODO: Need to figure out what the best way to remove a Stay will be. By its ID?
	removeStay(stay: Stay)
	{
		let index: number = this._stays.indexOf(stay.id, 0);
		if(index > -1) {
			this._stays.splice(index, 0);
		}
		//this._ratingsScore = Sitter.getRatingsScoreFromSitter(this);
		//this._overallSitterRank = Sitter.getOverallSitterRankFromSitter(this);
	}
*/



}




/*
import mongoose = require("mongoose");
const Schema = mongoose.Schema;

var SitterSchema = new Schema(
{
    Name:
    {
        type: String,
        trim: true,
        required: [true, "The sitter must have a name."]
    },
    Image:
    {
        type: String,
        trim: true,
        required: false
    },
    PhoneNumber:
    {
        type: String,
        trim: true,
        required: [true, "The sitter must have a phone number."]
    },
    EmailAddress:
    {
        type: String,
        trim: true,
        required: [true, "The sitter must have an email address."]
    },
    // TODO: Instead of doing our score processing in middleware, could we do it in setters instead? The middleware is finnicky, and doesn't always get triggered when you think it will.
    Stays:
    [{
        type: Schema.Types.ObjectId,
        ref: "Stay"
    }],
    // We're forced to store both of these denormalized values because we want to create an index for searching/sorting on them.
    OverallSitterRank:
    {
        type: Number,
        index: true,
        select: true
    },
    RatingsScore:
    {
        type: Number,
        index: true,
        select: true
    }
},
{
    collection: "Sitters",
    toJSON:
    {
        virtuals: true
    }
});

SitterSchema.virtual("SitterScore").get(function()
{
    var preparedName = this.Name ? this.Name.toLowerCase().replace(/[^a-z0-9]/gi, "") : "";
    let uniqueLetterCount = new Set(preparedName.split("")).size;
    
    return (uniqueLetterCount / 26) * 5;
});

SitterSchema.virtual("NumberOfStays").get(function()
{
    return (this.Stays ? this.Stays.length : 0);
});

var calculateRatingsScoreForSitter = function (sitter)
{
    if (sitter.NumberOfStays == 0)
    {
        return 0;
    }
    else
    {
        var ratingsSum = sitter.Stays
            .map(stay => stay.Rating)
            .reduce((runningTotal, rating) => (runningTotal + rating));
        
        return (ratingsSum / sitter.NumberOfStays);
    }
}

var calculateOverallRankForSitter = function (sitter)
{
    // If the sitter has no Stays, then the OverallSitterRank is just their SitterScore.
    if (sitter.NumberOfStays == 0)
    {
        return sitter.SitterScore;
    }
    else
    {
        var ratingWeight = sitter.NumberOfStays < 10 ? (sitter.NumberOfStays / 10) : 1;
        return (sitter.SitterScore * (1 - ratingWeight)) + (sitter.RatingsScore * ratingWeight);
    }
}

SitterSchema.pre("save", function (next)
{
    this.RatingsScore = calculateRatingsScoreForSitter(this);
    this.OverallSitterRank = calculateOverallRankForSitter(this);

    next();
});

SitterSchema.methods.equals = function (other)
{
    return this.Name == other.Name
        && this.Image == other.Image
        && this.PhoneNumber == other.PhoneNumber
        && this.EmailAddress == other.EmailAddress;
};

SitterSchema.methods.toString = function ()
{
    return `Name: \"${this.Name}\", PhoneNumber: \"${this.PhoneNumber}\", EmailAddress: \"${this.EmailAddress}\"`;
}

*/