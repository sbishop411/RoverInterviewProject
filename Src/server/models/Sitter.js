var mongoose = require("mongoose");
var Schema = mongoose.Schema;

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
    // We're forced to store both of these denormalized values because we need to index them. This really, really sucks.
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
    // This is the name of the corresponding MongoDB collection.
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

// If we save any changes to the sitter, we should recalculate the RatingsScore and OverallSitterRank.
SitterSchema.pre("save", function(next, done)
{
    this.RecalculateRanks();
    next();
});

// If we update the sitter, we should recalculate the RatingsScore and OverallSitterRank.
SitterSchema.pre("update", function(next, done)
{
    this.RecalculateRanks();
    next();
});

// TODO: Due to circular dependencies, I don't know of a good way to ensure that all associated stays are removed when the sitter is.
SitterSchema.pre("remove", function(next, done)
{
    for(var i = 0; i < this.Stays.length; i++)
    {
        // TODO: There's a bug in this functionality. Dependent Syaus are not currently being removed when the sitter they're associated with is deleted.
        // This odd way of referencing the Stay model is sso we can avoid a circular definition dependency. 
        mongoose.model("Stay").remove({id: mongoose.Types.ObjectId(this.Stays[i].id)}, function(error)
        {
            // If an error occurred, return a 400 response with the error message.
            if(error) next(response.status(500).send({message: error}));
        });
    }
    
    next();
});

// Helper method to recalculate the RatingsScore and OverallSitterRank. NOTE: The Stays array MUST be populated with actual stays before running this.
SitterSchema.methods.RecalculateRanks = function()
{
    if(this.NumberOfStays == 0)
    {
        this.RatingsScore = 0;
    }
    else
    {
        var totalRatings = 0;

        for(var i=0; i< this.Stays.length; i++)
        {        
            totalRatings += this.Stays[i].Rating;
        }
    
        this.RatingsScore = (totalRatings / this.NumberOfStays);
    }
    
    // If the sitter has no Stays, then the OverallSitterRank is just their SitterScore.
    if(this.NumberOfStays < 1)
    {
        this.OverallSitterRank = this.SitterScore;
    }
    else
    {
        // Determine how much each rating should be weighted into the overall score.
        var sitterScoreWeight = (this.NumberOfStays < 10 ? 1-(this.NumberOfStays/10) : 0);
        var ratingsScoreWeight = (this.NumberOfStays < 10 ? this.NumberOfStays/10: 1);
        
        // Set the OverallSitterRank value.
        this.OverallSitterRank = (this.SitterScore * sitterScoreWeight) + (this.RatingsScore * ratingsScoreWeight);
    }
};

mongoose.model("Sitter", SitterSchema);
