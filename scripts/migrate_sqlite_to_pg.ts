import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientSQLite } from '../node_modules/@prisma/client-sqlite';

async function migrate() {
    const pg = new PrismaClient();
    const sqlite = new PrismaClientSQLite();

    console.log('🚀 Starting migration to PostgreSQL...');

    try {
        // 1. Fetch data from SQLite
        console.log('📥 Fetching data from SQLite...');
        const users = await sqlite.user.findMany();
        const phases = await sqlite.phase.findMany();
        const tasks = await sqlite.task.findMany();

        console.log(`📊 Found: ${users.length} Users, ${phases.length} Phases, ${tasks.length} Tasks`);

        // 2. Clear Postgres (DANGER: Fresh migration)
        console.log('🧹 Preparing PostgreSQL database...');
        await pg.task.deleteMany();
        await pg.phase.deleteMany();
        await pg.user.deleteMany();

        // 3. Migrate Users
        console.log('👤 Migrating Users...');
        for (const user of users) {
            await pg.user.create({
                data: user
            });
        }

        // 4. Migrate Phases
        console.log('🏗️ Migrating Phases...');
        for (const phase of phases) {
            await pg.phase.create({
                data: {
                    id: phase.id,
                    name: phase.name,
                    order: phase.order
                }
            });
        }

        // 5. Migrate Tasks
        console.log('📋 Migrating Tasks...');
        for (const task of tasks) {
            // Remove updatedAt to let DB generate it or keep it
            const { updatedAt, ...taskData } = task;
            await pg.task.create({
                data: taskData as any
            });
        }

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pg.$disconnect();
        await sqlite.$disconnect();
    }
}

migrate();
