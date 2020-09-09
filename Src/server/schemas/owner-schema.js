const mongoose = require("mongoose");
const chalk = require("chalk");
const Schema = mongoose.Schema;
const StaySchema = require("./stay-schema");

// TODO: Look into refactoring these schemas to be based on ES6 classes, possibly with the help of typegoose once we've implemented TypeScript.
var OwnerSchema = new Schema(
{
    Name:
    {
        type: String,
        trim: true,
        required: [true, "The owner must have a name."]
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
        required: [true, "The owner must have a name."]
    },
    EmailAddress:
    {
        type: String,
        trim: true,
        required: [true, "The owner must have a name."]
    },
    Stays:
    [{
        type: Schema.Types.ObjectId,
        ref: "Stay"
    }]
},
{
    collection: "Owners"
});

OwnerSchema.pre("remove", async function(next)
{
    /*
    // TODO: Re-write this using try/catch and async/await.
    var stayQuery = StaySchema.find({ Owner: mongoose.Types.ObjectId(this.id) });
    stayQuery.populate("Owner").exec(function(error, stays)
    {
        if(error) next(response.status(400).send({message: error}));

        // Since we're removing the Owner, we should remove all their associated Stays too.
        for(var i = 0; i < stays.length; i++)
        {
            stays[i].remove(function (error)
            {
                if(error) next(response.status(500).send({message: error}));
            });
        }
        
        next();
    });
    */
    
    // Note: the .deleteMany() method doesn't trigger pre- or post-remove hooks, so we're stuck looping through our Stays.
    
    let staysToRemove = await StaySchema.find({ Owner: this }).exec();
    
    for (stay of staysToRemove)
    {
        try
        {
            await StaySchema.findByIdAndDelete(stay).exec();
        }
        catch (error)
        {
            console.log(chalk.red("Critical error while deleting Stay as a result of deleting an Owner:"));
            console.log("Owner: " + this.toString());
            console.log("Stay : " + stay.toString());
            console.log(error);
        }
    }

    next();
});

OwnerSchema.methods.equals = function (other)
{
    // This is JavaScript, so type safety really doesn't matter, right? Can't wait until we implement TypeScript...
    return this.Name == other.Name
        && this.Image == other.Image
        && this.PhoneNumber == other.PhoneNumber
        && this.EmailAddress == other.EmailAddress;
};

OwnerSchema.methods.toString = function ()
{
    return `Name: \"${this.Name}\", PhoneNumber: \"${this.PhoneNumber}\", EmailAddress: \"${this.EmailAddress}\"`;    
}

OwnerSchema.query.findMatching = function (other)
{
    return this.where({
        Name: other.Name,
        PhoneNumber: other.PhoneNumber,
        EmailAddress: other.EmailAddress,
        Image: other.Image
    }).populate("Stays");
}

module.exports = mongoose.model("Owner", OwnerSchema);
