import type { TimePeriods } from "./TimePeriods";

export interface TimePeriodTranslations {
    timePeriodTranslateId?: number;
    timePeriodId?: number;
    timePeriod: TimePeriods;
    language: string; 
    name: string;
    startYear?: string;
    endYear?: string;
    description?: string;
    createdAt?: Date;
}