import type { Events } from "./Events";

export interface EventTypes {
    eventTypeId?: number;  
    name: 'event' | 'battle' | 'biography';
    events: Events[];
}
