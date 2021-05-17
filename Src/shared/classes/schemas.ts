import { getModelForClass } from "@typegoose/typegoose"
import { Owner } from "./owner"
//import { Sitter } from "./sitter"
//import { Stay } from "./stay"

export const OwnerSchema = getModelForClass(Owner, { options: { customName: "Owners" }});
//export const SitterSchema = getModelForClass(Sitter, { options: { customName: "Sitters" }});
//export const StaySchema = getModelForClass(Stay, { options: { customName: "Stays" }});
