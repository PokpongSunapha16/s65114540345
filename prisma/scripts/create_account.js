const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("person123", 10);

  const existingUser = await prisma.user.findUnique({
    where: { mail: "person1@gmail.com" },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        username: "person1",
        mail: "person1@gmail.com",
        password: hashedPassword,
        role: "USER",
      },
    });
    console.log("✅ Created user: person1");
  } else {
    console.log("ℹ️ User already exists, skip seeding");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error creating user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// "create_admin": "node prisma/scripts/"