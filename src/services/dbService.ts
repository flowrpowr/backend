import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dbService = {
  async findOrCreateUser(walletAddress: string) {
    return prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress, createdAt: new Date() },
    });
  },

  async createTrack(data: {
    title: string;
    objectId: string;
    walrusId: string;
    genre: string;
    coverUrl: string;
    mimeType: string;
    fileSize: number;
    artistId: string;
    onChainObjectId: string;
  }) {
    return prisma.track.create({
      data: {
        ...data,
        uploadedAt: new Date(),
      },
    });
  },
};
