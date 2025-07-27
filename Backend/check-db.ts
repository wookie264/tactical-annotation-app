/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking database...');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    users.forEach(user => {
      console.log(`- User: ${user.username} (${user.email})`);
    });
    
    // Check admins
    const admins = await prisma.admin.findMany();
    console.log('Admins in database:', admins.length);
    admins.forEach(admin => {
      console.log(`- Admin: ${admin.username} (${admin.email})`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database check failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

void main(); 