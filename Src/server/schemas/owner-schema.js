const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
