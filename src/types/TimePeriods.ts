import type { Events } from "./Events";

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
}