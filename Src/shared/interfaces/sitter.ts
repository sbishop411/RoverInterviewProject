import { IBase } from "./base";
import { IStay } from "./stay";

export interface ISitter extends IBase {
	Name: string;
	Image: string;
	PhoneNumber: string;
	EmailAddress: string;
	readonly SitterScore: number;
	readonly RatingsScore: number;
	readonly OverallSitterRank: number;
	readonly Stays: Array<IStay>;
	addStay(stay: IStay): void;
	removeStay(stay: IStay): boolean;
	//constructor(name: string, image: string, phoneNumber: string, emailAddress: string, stays: Array<IStay>);


	/*
	get Stays(): Array<Stay> {
		return this._stays;
	}

	get OverallSitterRank(): number {
		return this._overallSitterRank;
	}

	get RatingsScore(): number {
		return this._ratingsScore;
	}

	get SitterScore(): number {
		let preparedName: string = this.Name ? this.Name.toLowerCase().replace(/[^a-z0-9]/gi, '') : "";
		let uniqueLetterCount: number = new Set(preparedName.split('')).size;
		
		return (uniqueLetterCount / 26) * 5;
	}

	updateRatingsScore(): void {
		if (this._stays.length == 0)
		{
			this._ratingsScore = 0;
		}
		else
		{
			let ratingsSum: number = this._stays
				.map(stay => stay.Rating)
				.reduce((runningTotal, rating) => (runningTotal + rating));
			
			this._ratingsScore = (ratingsSum / this._stays.length);
		}
	}

	updateOverallRank(): void {
		// If the sitter has no Stays, then the OverallSitterRank is just their SitterScore.
		if (this._stays.length == 0)
		{
			this._overallSitterRank = this.SitterScore;
		}
		else
		{
			let ratingWeight = this._stays.length < 10 ? (this._stays.length / 10) : 1;
			this._overallSitterRank = (this.SitterScore * (1 - ratingWeight)) + (this._ratingsScore * ratingWeight);
		}
	}

	// TODO: Maybe change the return type of this to boolean to return success/fail information.
	addStay(stay: Stay): void
	{
		this._stays.push(stay);
		this.updateRatingsScore();
		this.updateOverallRank();
	}

	
	//TODO: Need to figure out what the best way to remove a Stay will be. By its ID?
	removeStay(stay: Stay)
	{
		let index: number = this._stays.indexOf(key, 0);
		if(index > -1) {
			this._stays.splice(index, 0);
		}

		this.updateRatingsScore();
		this.updateOverallRank();
	}
	*/
}
