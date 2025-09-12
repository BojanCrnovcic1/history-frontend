import type { EventTranslations } from "./EventTranslations";
import type { EventTypes } from "./EventTypes";
import type { Locations } from "./Locations";
import type { Media } from "./Media";
import type { TimePeriods } from "./TimePeriods";

export interface Events {
    eventId?: number,
    title: string;
    description: string;
    timePeriodId: number | null;
    eventTypeId: number | null;
    locationId: number | null;
    year: string| null;
    isPremium: boolean | null
    updatedAt: Date | null;
    timePeriod: TimePeriods;
    eventType: EventTypes;
    location: Locations;
    media: Media[];
    translates: EventTranslations[];
}