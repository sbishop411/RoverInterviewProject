import { getModelForClass } from "@typegoose/typegoose"
import { Owner } from "./entities/owner"
import { Sitter } from "./entities/sitter"
import { Stay } from "./entities/stay"

export const OwnerModel = getModelForClass(Owner, { options: { customName: "owners" }});
export const SitterModel = getModelForClass(Sitter, { options: { customName: "sitters" }});
export const StayModel = getModelForClass(Stay, { options: { customName: "stays" }});
