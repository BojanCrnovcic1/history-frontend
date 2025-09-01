import type { Events } from "./Events";

export interface Media {
    mediaId?: number;
    eventId: number | null;
    mediaType: "image" | "video" | "audio";
    url: string;
    description: string | null;
    updatedAt: Date | null;
    event: Events;
}