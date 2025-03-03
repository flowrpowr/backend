import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const dbService = {
  async findOrCreateUser(artistAddress: string) {
    return prisma.user.upsert({
      where: { artistAddress },
      update: {},
      create: {
        artistAddress,
        username: artistAddress.slice(0, 8), // Generate a default username based on the address
        createdAt: new Date(),
      },
    });
  },

  async createTrack(data: {
    title: string;
    artist: string;
    genre: string;
    coverUrl: string;
    audioUrl: string;
    mimeType: string;
    fileSize: number;
    duration: number;
    suiId: string;
    artistId: string;
  }) {
    return prisma.track.create({
      data: {
        ...data,
        uploadedAt: new Date(),
      },
    });
  },
};
