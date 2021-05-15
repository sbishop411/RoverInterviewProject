import { IBase } from "./base";
import { IOwner } from "./owner";
import { ISitter } from "./sitter";

export interface IStay extends IBase {
	Owner: IOwner;
	Sitter: ISitter;
	Dogs: string;
	StartDate: Date;
	EndDate: Date;
	ReviewText: string;
	Rating: number;

	//constructor(owner: IOwner, sitter: ISitter, dogs: string, startDate: Date, endDate: Date, reviewText: string, rating: number);
}
