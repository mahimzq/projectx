import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientSQLite } from '../node_modules/@prisma/client-sqlite';

async function migrate() {
    const mysql = new PrismaClient();
    const sqlite = new PrismaClientSQLite();

    console.log('🚀 Starting migration...');

    try {
        // 1. Fetch data from SQLite
        console.log('📥 Fetching data from SQLite...');
        const users = await sqlite.user.findMany();
        const phases = await sqlite.phase.findMany();
        const tasks = await sqlite.task.findMany();

        console.log(`📊 Found: ${users.length} Users, ${phases.length} Phases, ${tasks.length} Tasks`);

        // 2. Clear MySQL (DANGER: Fresh migration)
        console.log('🧹 Preparing MySQL database...');
        await mysql.task.deleteMany();
        await mysql.phase.deleteMany();
        await mysql.user.deleteMany();

        // 3. Migrate Users
        console.log('👤 Migrating Users...');
        for (const user of users) {
            await mysql.user.create({
                data: user
            });
        }

        // 4. Migrate Phases
        console.log('🏗️ Migrating Phases...');
        for (const phase of phases) {
            await mysql.phase.create({
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
            // Remove updatedAt to let MySQL generate it or keep it
            const { updatedAt, ...taskData } = task;
            await mysql.task.create({
                data: taskData
            });
        }

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mysql.$disconnect();
        await sqlite.$disconnect();
    }
}

migrate();
