const mongoose = require("mongoose");
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
    var preparedName = this.Name ? this.Name.toLowerCase().replace(/[^a-z0-9]/gi, '') : "";
    let uniqueLetterCount = new Set(preparedName.split('')).size;
    
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

SitterSchema.query.findMatching = function (other)
{
    return this.where({
        Name: other.Name,
        PhoneNumber: other.PhoneNumber,
        EmailAddress: other.EmailAddress,
        Image: other.Image
    }).populate("Stays");
}

module.exports = mongoose.model("Sitter", SitterSchema);
