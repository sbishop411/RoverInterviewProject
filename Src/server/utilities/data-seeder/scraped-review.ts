import { Owner } from "../../../shared/classes/owner";
import { Sitter } from "../../../shared/classes/sitter";
import { Stay } from "../../../shared/classes/stay";

export class ScrapedReview
{
	owner: Owner;
	sitter: Sitter;
	stay: Stay;
	
	constructor(csvLine: string)
	{
		this.owner = new Owner(csvLine[7].trim(), csvLine[11].trim(), csvLine[12].trim(), csvLine[4].trim());
		this.sitter = new Sitter(csvLine[6].trim(), csvLine[9].trim(), csvLine[10].trim(), csvLine[1].trim());
		this.stay = new Stay(this.owner, this.sitter, csvLine[5].trim(), new Date(csvLine[8].trim()), new Date(csvLine[2].trim()), csvLine[3].trim(), parseInt(csvLine[0].trim()));
	}
}
