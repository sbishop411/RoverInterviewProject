const mongoose = require("mongoose");
const chalk = require("chalk");
const Schema = mongoose.Schema;
const OwnerSchema = require("./owner-schema");
const SitterSchema = require("./sitter-schema");

var StaySchema = new Schema(
{
    Owner:
    {
        type: Schema.Types.ObjectId,
        ref: "Owner",
        required: [true, "The stay must be associated with an owner."],
        set: function (newOwner)
        {
            if (this.Owner && this.Owner._id != newOwner) this._previousOwner = this.Owner._id;
            return newOwner;
        }
    },
    Sitter:
    {
        type: Schema.Types.ObjectId,
        ref: "Sitter",
        required: [true, "The stay must be associated with a sitter."],
        set: function (newSitter)
        {
            if (this.Sitter && this.Sitter._id != newSitter) this._previousSitter = this.Sitter._id;
            return newSitter;
        }
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

var removeStayFromOwner = async function (owner, stay)
{
    try
    {
        let ownerModel = await OwnerSchema.findById(owner)
            .populate("Stays")
            .exec();

        let stayIndex = ownerModel.Stays.indexOf(stay);
        ownerModel.Stays.splice(stayIndex, 1);
        ownerModel.save();
    }
    catch (error)
    {
        console.log(chalk.redBright("Critical error while removing stay from owner:"));
        console.error(error);
    }
}

var addStayToOwner = async function (owner, stay)
{
    try
    {
        let ownerModel = await OwnerSchema.findById(owner)
            .populate("Stays")
            .exec();

        ownerModel.Stays.push(stay);
        ownerModel.save();
    }
    catch (error)
    {
        console.log(chalk.redBright("Critical error while adding stay to owner:"));
        console.error(error);
    }
}

var removeStayFromSitter = async function (sitter, stay)
{
    try
    {
        let sitterModel = await SitterSchema.findById(sitter)
            .populate("Stays")
            .exec();
    
        let stayIndex = sitterModel.Stays.indexOf(stay);
        sitterModel.Stays.splice(stayIndex, 1);
        sitterModel.save();
    }
    catch (error)
    {
        console.log(chalk.redBright("Critical error while removing stay from sitter:"));
        console.error(error);
    }
}

var addStayToSitter = async function (sitter, stay)
{
    try
    {
        let sitterModel = await SitterSchema.findById(sitter)
            .populate("Stays")
            .exec();

        sitterModel.Stays.push(stay);
        sitterModel.save();
    }
    catch (error)
    {
        console.log(chalk.redBright("Critical error while adding stay to sitter:"));
        console.error(error);
    }
}

// Mongoose sucks, and we don't have access to this.isNew or this.modifiedPaths() in the post hook, so we need to set them on the document here.
StaySchema.pre("save", function (next)
{
    this.isNewStay = this.isNew;
    this.alteredProperties = this.modifiedPaths();

    next();
});

StaySchema.post("save", async function (stay, next)
{
    if (this.isNewStay)
    {
        await addStayToOwner(this.Owner, this);
        await addStayToSitter(this.Sitter, this);
    }
    else
    {
        if (this.alteredProperties.includes("Rating"))
        {
            let sitterModel = await SitterSchema.findById(stay.Sitter)
                .populate("Stays")
                .exec();

            sitterModel.save();
        }

        if (this._previousOwner)
        {
            await addStayToOwner(this.Owner, this);
            await removeStayFromOwner(this._previousOwner, this);
        }

        if (this._previousSitter)
        {
            await addStayToSitter(this.Sitter, this);
            await removeStayFromSitter(this._previousSitter, this);
        }
    }

    next();
});

StaySchema.post("remove", async function (stay, next)
{
    try
    {
        let sitterModel = await SitterSchema.findById(stay.Sitter)
            .populate("Stays")
            .exec();

        sitterModel.save();
    }
    catch (error)
    {
        console.log(chalk.redBright("Critical error while updating sitter after deleting stay:"));
        console.error(error);
    }

    next();
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
