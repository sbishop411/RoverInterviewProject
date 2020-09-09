module.exports = class ScrapedReview
{
	constructor(csvLine)
	{
		this.Owner = {
			Name: csvLine[7].trim(),
			PhoneNumber: csvLine[11].trim(),
			EmailAddress: csvLine[12].trim(),
			Image: csvLine[4].trim()
		};

		this.Sitter = {
			Name: csvLine[6].trim(),
			PhoneNumber: csvLine[9].trim(),
			EmailAddress: csvLine[10].trim(),
			Image: csvLine[1].trim()
		};

		this.Stay = {
			// OwnerId and SitterId will be set after the corresponding Owner/Sitter has been found/created.
			OwnerId: null,
			SitterId: null,
			Dogs: csvLine[5].trim(),
			StartDate: csvLine[8].trim(),
			EndDate: csvLine[2].trim(),
			Rating: csvLine[0].trim(),
			Text: csvLine[3].trim()
		};
	}
}
