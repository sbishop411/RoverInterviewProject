const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Sitter = require("./Sitter");

var StaySchema = new Schema(
{
    Owner:
    {
        type: Schema.Types.ObjectId,
        ref: "Owner",
        required: [true, "The stay must be associated with an owner."]
    },
    Sitter:
    {
        type: Schema.Types.ObjectId,
        ref: "Sitter",
        required: [true, "The stay must be associated with a sitter."]
    },
    Dogs:
    {
        type: String,
        trim: true,
        required: [true, "The stay must be associated with at least one dog."]
    },
    StartDate:
    {
        type: Date,
        trim: true,
        required: [true, "The stay must have a start date."]
    },
    EndDate:
    {
        type: Date,
        trim: true,
        required: [true, "The stay must have an end date."]
    },
    ReviewText:
    {
        type: String,
        trim: true,
        required: false
    },
    Rating:
    {
        type: Number,
        required: true,
        min: [1, "Stay ratings must be between 1 and 5."],
        max: [5, "Stay ratings must be between 1 and 5."]
    }
},
{
    collection: "Stays"
});

StaySchema.post("save", function(stay, next)
{
    var sitterQuery = Sitter.findOne({Stays: mongoose.Types.ObjectId(stay.id)});
    sitterQuery.populate("Stays").exec(function(error, sitter)
    {
        if(error) next(response.status(400).send({message: error}));
        
        if(sitter)
        {
            // Calling save() here triggers Sitter.RecalculateRanks() and updated the sitter with the new correct value.
            sitter.save(function(error)
            {
                if(error) next(response.status(400).send({message: error}));
            });
        }
        else
        {
            next();
        }
    });
});

StaySchema.pre("remove", function(next)
{
    var stayId = this.id;

    var sitterQuery = Sitter.findOne({Stays: mongoose.Types.ObjectId(this.id)});
    sitterQuery.populate("Stays").exec(function(error, sitter)
    {
        if(error) next(response.status(400).send({message: error}));
        
        if(sitter)
        {
            // In Javascript, there's no effective .pop() method, so we have to get an index to .splice() the element out.
            var sitterSpliceIndex;
            for(var i = 0; i < sitter.Stays.length; i++)
            {
                if(sitter.Stays[i].id == stayId) sitterSpliceIndex = i;
            }
            if(sitterSpliceIndex !== null && sitterSpliceIndex > -1) sitter.Stays.splice(sitterSpliceIndex, 1);

            sitter.save(function(error)
            {
                if(error) next(response.status(400).send({message: error}));
            });
        }
        else
        {
            next();
        }
    });
});

StaySchema.methods.equals = function (other)
{
    return this.Owner == other.Owner
        && this.Sitter == other.Sitter
        && this.Dogs == other.Dogs
        && this.StartDate == other.StartDate
        && this.EndDate == other.EndDate
        && this.ReviewText == other.ReviewText
        && this.Rating == other.Rating;
};

module.exports = mongoose.model("Stay", StaySchema);
