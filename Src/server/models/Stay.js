const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Owner = require("./Owner");
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

StaySchema.post("save", async function (stay, next)
{
    // Update the Owner that this Stay is related to.
    try
    {
        let owner = await Owner.findById(stay.Owner).exec();
        if (owner === null) throw new Error("The supplied Owner does not have an ID corresponding to an existing Owner.");
        
        owner.Stays.push(stay);
        owner.save();
    }
    catch (error)
    {
        console.log(chalk.red("Critical error while saving Stay: "));
        console.log(error);
    }

    // Update the Sitter that this Stay is related to.
    try
    {
        let sitter = await Sitter.findById(stay.Sitter).populate("Stays").exec();
        if (sitter === null) throw new Error("The supplied Sitter does not have an ID corresponding to an existing Sitter.");

        sitter.Stays.push(stay);
        sitter.save();
    }
    catch (error)
    {
        console.log(chalk.red("Critical error while saving Stay: "));
        console.log(error);
    }

    next();
});

StaySchema.pre("remove", function(next)
{
    // TODO: Re-write this using try/catch, async/await, and findById().
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
    // TODO: Checking equivalence by using the Sitter and Owner name here is pretty weak. Maybe we can implement this better after we're using TypeScript?
    return this.Owner.Name == other.Owner.Name
        && this.Sitter.Name == other.Sitter.Name
        && this.Dogs == other.Dogs
        && this.StartDate == other.StartDate
        && this.EndDate == other.EndDate
        && this.ReviewText == other.ReviewText
        && this.Rating == other.Rating;
};

StaySchema.methods.toString = function ()
{
    return `Owner: \"${this.Owner.Name}\", Sitter: \"${this.Sitter.Name}\", Dogs: \"${this.Dogs}\", StartDate: \"${this.StartDate}\", EndDate: \"${this.EndDate}\"`;
}

StaySchema.query.findMatching = function (other)
{
    return this.where({
        Owner: other.OwnerId,
        Sitter: other.SitterId,
        Dogs: other.Dogs,
        StartDate: other.StartDate,
        EndDate: other.EndDate,
        ReviewText: other.ReviewText,
        Rating: other.Rating
    }).populate("Sitter").populate("Owner");
}

module.exports = mongoose.model("Stay", StaySchema);
