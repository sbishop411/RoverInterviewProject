import { IBase } from "./base";
import { IStay } from "./stay";

export interface IOwner extends IBase {
	Name: string;
	Image: string;
	PhoneNumber: string;
	EmailAddress: string;
	readonly Stays: Array<IStay>;
	addStay(stay: IStay): void;
	removeStay(stay: IStay): boolean;
}
