import type { Events } from "./Events";
import type { TimePeriodTranslations } from "./TimePeriodTranslations";

export interface TimePeriods {
    timePeriodId?: number;
    name: string;
    startYear: string | null;
    endYear: string | null;
    parentTimePeriodId: number | null;
    description: string | null;
    parent: TimePeriods | null;
    children: TimePeriods[];
    events: Events[];
    translations?: TimePeriodTranslations[];
}