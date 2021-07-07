import * as mongoose from "mongoose";
import { pre, post, prop, buildSchema } from "@typegoose/typegoose";

// TODO: The front-end shouldn't rely on this class, since that will tightly couple it with mongoose/typegoose.
@pre<BaseEntity>("save", function(this: BaseEntity, next: any) {
	this.updatedDate = new Date(Date.now());
	next();
})
export abstract class BaseEntity {
	@prop({
		required: false,
		default: Date.now()
	})
	public createdDate?: Date;

	@prop({
		required: false,
		default: Date.now()
	})
	public updatedDate?: Date;

	id?: mongoose.Types.ObjectId;

	static get schema(): mongoose.Schema {
		return buildSchema(this as any, {
			timestamps: true,
			toJSON: {
				getters: true,
				virtuals: true,
			},
		});
	}

	static get modelName(): string {
		return this.name;
	}
}
