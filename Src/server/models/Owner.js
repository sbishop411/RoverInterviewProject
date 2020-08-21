require("./Stay");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Stay = mongoose.model("Stay");

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
    }
},
{
    // This is the name of the corresponding MongoDB collection.
    collection: "Owners"
});

// If an owner is going to be deleted, we should remove all of the reviews that they've left.
OwnerSchema.pre("remove", function(next)
{
    var stayQuery = Stay.find({Owner: mongoose.Types.ObjectId(this.id)});
    stayQuery.populate("Owner").exec(function(error, stays)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) next(response.status(400).send({message: error}));

        for(var i = 0; i < stays.length; i++)
        {
            stays[i].remove(function(error)
            {
                // If an error occurred, return a 400 response with the error message.
                if(error) next(response.status(500).send({message: error}));
            });
        }
        
        next();
    });
});

mongoose.model("Owner", OwnerSchema);
