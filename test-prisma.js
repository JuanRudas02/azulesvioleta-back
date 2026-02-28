import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.count();
    console.log(`User count: ${users}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
