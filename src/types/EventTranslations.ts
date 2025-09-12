import type { Events } from "./Events";

export interface EventTranslations {
    translateId?: number;
    eventId?: number;
    event: Events;
    language: string;
    title: string;
    description: string;
    createdAt?: Date;
}