const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    if (users.length > 0) {
      console.log('First user:', users[0].email);
    } else {
      console.log('No users found! Database is empty.');
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
