import { getModelForClass } from "@typegoose/typegoose"
import { Owner } from "./entities/owner"
import { Sitter } from "./entities/sitter"
import { Stay } from "./entities/stay"

export const OwnerSchema = getModelForClass(Owner, { options: { customName: "Owners" }});
export const SitterSchema = getModelForClass(Sitter, { options: { customName: "Sitters" }});
export const StaySchema = getModelForClass(Stay, { options: { customName: "Stays" }});
