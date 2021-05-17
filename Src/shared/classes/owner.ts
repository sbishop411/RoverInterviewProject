import { prop, Ref, queryMethod, modelOptions, ReturnModelType } from "@typegoose/typegoose";
import { AsQueryMethod } from "@typegoose/typegoose/lib/types";
import { BaseEntity } from "./baseEntity";
//import { Stay } from "./stay";

interface QueryHelpers {
	findByName: AsQueryMethod<typeof findByName>;
	findMatching: AsQueryMethod<typeof findMatching>;
}

function findByName(this: ReturnModelType<typeof Owner, QueryHelpers>, name: string) {
	return this.findOne({
        name: name
    })/*.populate("_stays")*/;
}

function findMatching(this: ReturnModelType<typeof Owner, QueryHelpers>, other: Owner) {
	return this.where({
        Name: other.name,
        PhoneNumber: other.phoneNumber,
        EmailAddress: other.emailAddress,
        Image: other.image
    })/*.populate("_stays")*/;
}

//@pre()
//@post()
/*
@modelOptions({
	options: {
		customName: "Owners"
	},
	schemaOptions: {
		collection: "Owners"
	}
})
*/
@queryMethod(findByName)
@queryMethod(findMatching)
export class Owner extends BaseEntity {
	@prop({
		required: [true, "The owner must have a name."],
		trim: true,
	})
	public name!: string;

	@prop({
		required: false,
		trim: true,
	})
	public image: string;

	@prop({
		required: [true, "The owner must have a phone number."],
		trim: true,
	})
	public phoneNumber!: string;

	@prop({
		required: [true, "The owner must have a unique email address."],
		unique: true,
		trim: true,
	})
	public emailAddress!: string;

	/*
	@prop({
		ref: () => Stay,
		default: []
	})
	private _stays: Array<Ref<Stay>>;
	*/

	constructor(name: string, image: string, phoneNumber: string, emailAddress: string/*, stays?: Array<Ref<Stay>>*/) {
		super();
		this.name = name;
		this.image = image;
		this.phoneNumber = phoneNumber;
		this.emailAddress = emailAddress;
		//this._stays = stays as Array<Ref<Stay>>;
	}

	/*
	get Stays(): Array<Ref<Stay>> {
		return this._stays;
	}
	*/

	/*
	public addStay(stay: Stay): void
	{
		this._stays.push(stay);
	}
	*/

	/*
	public removeStay(stay: Stay): boolean
	{
		let index: number = this._stays.indexOf(stay.id, 0);
		if(index > -1) {
			this._stays.splice(index, 0);
			return true;
		}
		else
		{
			return false;
		}
	}
	*/

	public toString(): string {
		return `Name: \"${this.name}\", PhoneNumber: \"${this.phoneNumber}\", EmailAddress: \"${this.emailAddress}\"`;
	}

	public equals(other: Owner): boolean
	{
		return this.name == other.name
			&& this.image == other.image
			&& this.phoneNumber == other.phoneNumber
			&& this.emailAddress == other.emailAddress;
	}
}

//export const OwnerSchema = getModelForClass(Owner);
//expect(OwnerSchema.modelName).to.be.equal("Owners");
