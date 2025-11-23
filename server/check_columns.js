
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`SHOW COLUMNS FROM cotizaciones`;
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
