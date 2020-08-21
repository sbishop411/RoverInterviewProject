require("./Sitter");
//require("./Owner");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Sitter = mongoose.model("Sitter");
//var Owner = mongoose.model("Owner");

var StaySchema = new Schema(
{
    Owner:
    {
        type: Schema.Types.ObjectId,
        ref: "Owner",
        required: [true, "The stay must be associated with an owner."]
        // TODO: Due to circular dependencies, I don't know of a good way to validate this Owner id...
        /*
        ,validate:
        {
            validator: function(value)
            {
                Owner.findById(value)
                    .exec(function(error, owner)
                    {
                        return (error || !owner) ? false : true;
                    });
            }
        }
        */
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
        min: [1, "Stay ratings must be bewtween 1 and 5."],
        max: [5, "Stay ratings must be bewtween 1 and 5."]
    }
},
{
    // This is the name of the corresponding MongoDB collection.
    collection: "Stays"
});

// If the stay is being updated and the rating is changing, we need to recalculate the RatingsScore and OverallSitterRank for the sitter this belongs to.
StaySchema.post("save", function(stay, next)
{
    // TODO: I'd like to see if there's a way to determine whether or not the Rating field specifcally was changed by the update.
    var stayId = this.id;

    var sitterQuery = Sitter.findOne({Stays: mongoose.Types.ObjectId(stay.id)});
    sitterQuery.populate("Stays").exec(function(error, sitter)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) next(response.status(400).send({message: error}));
        
        // We should always find a sitter, but just in case, we should check.
        if(sitter)
        {
            // Even though we haven't changes the sitter, we need to invoke the save action, which will trigger the recalculation of the sitter's RatingsScore and OverallSitterRank.
            sitter.save(function(error)
            {
                // If an error occurred, return a 400 response with the error message.
                if(error) next(response.status(400).send({message: error}));

                next();
            });
        }
        else
        {
            next();
        }
    });
});

// If a stay is going to be deleted, we need to update the sitter that's referencing it.
StaySchema.pre("remove", function(next)
{
    var stayId = this.id;

    var sitterQuery = Sitter.findOne({Stays: mongoose.Types.ObjectId(this.id)});
    sitterQuery.populate("Stays").exec(function(error, sitter)
    {
        // If an error occurred, return a 400 response with the error message.
        if(error) next(response.status(400).send({message: error}));
        
        // We should always find a sitter, but just in case, we should check.
        if(sitter)
        {
            // In Javascript, there's no effective .pop() method, so we have to get an index to .splice() the element out.
            var sitterSpliceIndex;
            for(var i = 0; i < sitter.Stays.length; i++)
            {
                if(sitter.Stays[i].id == stayId) sitterSpliceIndex = i;
            }

            // If we've found a refernce to the Stay, splice it out of the list.
            if(sitterSpliceIndex !== null && sitterSpliceIndex > -1) sitter.Stays.splice(sitterSpliceIndex, 1);

            sitter.save(function(error)
            {
                // If an error occurred, return a 400 response with the error message.
                if(error) next(response.status(400).send({message: error}));

                next();
            });
        }
        else
        {
            next();
        }
    });
});

mongoose.model("Stay", StaySchema);