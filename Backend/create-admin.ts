/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const fullname = process.argv[4];
  const email = process.argv[5];
  const phone = process.argv[6]; // Optional

  if (!username || !password || !fullname || !email) {
    console.error('Usage: ts-node create-user.ts <username> <password> <fullname> <email> [phone]');
    console.error('Example: ts-node create-user.ts admin123 password123 "John Doe" john@example.com "+1234567890"');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  const adminData = {
    username,
    fullname,
    email,
    password: hashed,
    ...(phone && { phone })
  };

  const admin = await prisma.admin.create({
    data: adminData,
  });

  console.log('Admin created:', admin);
  await prisma.$disconnect();
}

void (async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
