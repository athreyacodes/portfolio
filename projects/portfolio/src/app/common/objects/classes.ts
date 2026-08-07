import { PageType } from "./enums";

export class NavItem {
    PageType: PageType;
    Icon: string;
    Name: string;
    Active: boolean;
    Description: string;
    localePath: string;

    constructor(values: any | undefined) {
        this.PageType = values.PageType || PageType.Banner;
        this.Icon = values.Icon || 'star';
        this.Name = values.Name || 'PageType';
        this.Active = values.Active || false;
        this.Description = values.Description || '';
        this.localePath = values.localePath || '';
    }
}