import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.board.upsert({
    where: {
      name: "b",
    },
    update: {},
    create: {
      name: "b",
      description: "Random",
    },
  });

  await prisma.board.upsert({
    where: {
      name: "biz",
    },
    update: {},
    create: {
      name: "biz",
      description: "Business",
    },
  });

  await prisma.board.upsert({
    where: {
      name: "g",
    },
    update: {},
    create: {
      name: "g",
      description: "Technology",
    },
  });

  await prisma.board.upsert({
    where: {
      name: "mu",
    },
    update: {},
    create: {
      name: "mu",
      description: "Music",
    },
  });

  await prisma.board.upsert({
    where: {
      name: "tv",
    },
    update: {},
    create: {
      name: "tv",
      description: "Television & Film",
    },
  });

  await prisma.board.upsert({
    where: {
      name: "sp",
    },
    update: {},
    create: {
      name: "sp",
      description: "Sports",
    },
  });

  await prisma.board.upsert({
    where: {
      name: "v",
    },
    update: {},
    create: {
      name: "v",
      description: "Video Games",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
