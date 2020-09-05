const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Stay = require("./Stay");

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

OwnerSchema.pre("remove", function(next)
{
    var stayQuery = Stay.find({Owner: mongoose.Types.ObjectId(this.id)});
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
});

OwnerSchema.methods.equals = function (other)
{
    // This is JavaScript, so type safety really doesn't matter, right? Can't wait until we implement TypeScript...
    return this.Name == other.Name
        && this.Image == other.Image
        && this.PhoneNumber == other.PhoneNumber
        && this.EmailAddress == other.EmailAddress;
};

module.exports = mongoose.model("Owner", OwnerSchema);
