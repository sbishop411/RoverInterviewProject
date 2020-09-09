const mongoose = require("mongoose");
const Stay = require("./Stay");
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
    Stays:
    [{
        type: Schema.Types.ObjectId,
        ref: "Stay"
    }],
    // We're forced to store both of these denormalized values because we need to index them.
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
    // We're checking to see if Name is populated here so we don't throw a hard error if they forgot to include it.
    var preparedName = this.Name ? this.Name.toLowerCase().replace(/[^a-z0-9]/gi,'') : "";

    var uniqueChars = "";

    for(var i = 0; i < preparedName.length; i++)
    {
        if(uniqueChars.indexOf(preparedName[i]) == -1)
        {
            uniqueChars += preparedName[i];
        }
    }
    
    return (uniqueChars.length / 26) * 5;
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
        var sitterScoreWeight = (sitter.NumberOfStays < 10 ? 1 - (sitter.NumberOfStays / 10) : 0);
        var ratingsScoreWeight = (sitter.NumberOfStays < 10 ? sitter.NumberOfStays / 10 : 1);

        return (sitter.SitterScore * sitterScoreWeight) + (sitter.RatingsScore * ratingsScoreWeight);
    }
}

SitterSchema.pre("save", function (next)
{
    this.RatingsScore = calculateRatingsScoreForSitter(this);
    this.OverallSitterRank = calculateOverallRankForSitter(this);

    next();
});

// TODO: Should we be doing this kind of processing at all? Should stays persist if the Sitter is deleted? Should they persist if an Owner is deleted? It would
// make sense that we still want to retain information that that stay happened.
SitterSchema.pre("remove", function(next, done)
{
    for (var i = 0; i < this.Stays.length; i++)
    {
        // TODO: Re-write this using try/catch and async/await.
        // TODO: There's a bug in this functionality. Dependent Stays are not currently being removed when the sitter they're associated with is deleted.
        // This odd way of referencing the Stay model is so we can avoid a circular definition dependency.
        mongoose.model("Stay").remove({id: mongoose.Types.ObjectId(this.Stays[i].id)}, function(error)
        {
            if(error) next(response.status(500).send({message: error}));
        });
    }
    
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
