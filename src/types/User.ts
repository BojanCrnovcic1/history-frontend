export interface User {
    userId?: number;
    username: string;
    email: string;
    password: string;
    isPremium: boolean | null;
    role: 'USER' | 'ADMIN' | null;
    subscriptionType: "monthly" | "yearly" | null;
    subscriptionExpiresAt: Date | null;
    isVerified?: boolean;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    subscriptions:[];
}