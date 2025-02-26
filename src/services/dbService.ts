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
    artistId: string;
    genre: string;
    coverUrl: string;
    mimeType: string;
    fileSize: number;
    suiId: string;
    blobId: string;
  }) {
    return prisma.track.create({
      data: {
        ...data,
        uploadedAt: new Date(),
      },
    });
  },
};
