import { prop, Ref, queryMethod, ReturnModelType } from "@typegoose/typegoose";
import { AsQueryMethod } from "@typegoose/typegoose/lib/types";
import { BaseEntity } from "./baseEntity";
import { Stay } from "./stay";

interface QueryHelpers {
	findByName: AsQueryMethod<typeof findByName>;
	findMatching: AsQueryMethod<typeof findMatching>;
}

function findByName(this: ReturnModelType<typeof Owner, QueryHelpers>, name: string) {
	return this.findOne({
        fullName: name
    });//.populate({ path: "_stays", model: Stay });
	// TODO: When we include the call to .populate(), we get the error "Schema hasn't been registered for model 'Stay'.", though I'm not sure why. I've create issue #29 to resolve this.
}

function findMatching(this: ReturnModelType<typeof Owner, QueryHelpers>, other: Owner) {
	return this.findOne({
        fullName: other.fullName,
        phoneNumber: other.phoneNumber,
        emailAddress: other.emailAddress,
        image: other.image
    }).populate({ path: "_stays", model: Stay });
}

@queryMethod(findByName)
@queryMethod(findMatching)
export class Owner extends BaseEntity {
	@prop({
		required: [true, "The owner must have a name."],
		trim: true,
	})
	public fullName!: string;

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

	@prop({
		required: false,
		ref: () => Stay,
	})
	private _stays: Ref<Stay>[];
	
	constructor(name: string, image: string, phoneNumber: string, emailAddress: string, stays?: Ref<Stay>[]) {
		super();
		this.fullName = name;
		this.image = image;
		this.phoneNumber = phoneNumber;
		this.emailAddress = emailAddress;
		this._stays = (stays === undefined || stays === null) ? new Array() : stays;
	}

	get Stays(): Ref<Stay>[] {
		return this._stays;
	}

	public addStay(this: Owner, stay: Stay): void
	{
		this._stays.push(stay);
	}

	/*
	public async addStayAndSave(stay: Stay): Promise<void>
	{
		this._stays.push(stay);
		await this.save();
	}
	*/

	public removeStay(this: Owner, stay: Stay): boolean
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

	public toString(): string {
		return `Name: \"${this.fullName}\", PhoneNumber: \"${this.phoneNumber}\", EmailAddress: \"${this.emailAddress}\"`;
	}

	public equals(other: Owner): boolean
	{
		return this.fullName == other.fullName
			&& this.image == other.image
			&& this.phoneNumber == other.phoneNumber
			&& this.emailAddress == other.emailAddress;
	}
}
