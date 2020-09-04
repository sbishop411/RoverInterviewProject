module.exports = class ScrapedReview
{
	constructor(csvLine)
	{
		this.StayRating = csvLine[0].trim();
		this.SitterImage = csvLine[1].trim();
		this.StayEndDate = csvLine[2].trim();
		this.StayText = csvLine[3].trim();
		this.OwnerImage = csvLine[4].trim();
		this.StayDogs = csvLine[5].trim();
		this.SitterName = csvLine[6].trim();
		this.OwnerName = csvLine[7].trim();
		this.StayStartDate = csvLine[8].trim();
		this.SitterPhoneNumber = csvLine[9].trim();
		this.SitterEmailAddress = csvLine[10].trim();
		this.OwnerPhoneNumber = csvLine[11].trim();
		this.OwnerEmailAddress = csvLine[12].trim();
	}
}
