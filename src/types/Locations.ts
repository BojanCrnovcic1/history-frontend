import type { Events } from "./Events";

export interface Locations {
    locationId?: number;
    name: string;
    latitude: string;
    longitude: string;
    events: Events[];
}