import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL || "postgres://93546db8871ffdbea173f22fe044f6bbc7d7d42be4eed4f59b79591890875334:sk_KQNjJMDoWdV384YhnHog8@db.prisma.io:5432/postgres?sslmode=require",
            },
        },
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
