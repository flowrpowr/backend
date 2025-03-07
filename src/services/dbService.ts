import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const dbService = {
  async findUser(walletAddress: string) {
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });
    if (!user) {
      console.error("Unable to find user with sui address: ", walletAddress);
      throw new Error(
        `Unable to find user with sui address: ", ${walletAddress}`
      );
    }
    return user;
  },

  async createTrack(data: {
    title: string;
    artistId: string;
    genre: string;
    coverUrl: string;
    audioUrl: string;
    mimeType: string;
    fileSize: number;
    duration: number;
    suiId: string;
  }) {
    return prisma.track.create({
      data: {
        ...data,
        uploadedAt: new Date(),
      },
    });
  },
  async findTrackBySuiId(suiId: string) {
    return prisma.track.findUnique({
      where: { suiId },
      include: {
        artistUser: true, // Include the user who created the track
      },
    });
  },
  async incrementStreamCount(trackId: string) {
    return prisma.track.update({
      where: { id: trackId },
      data: {
        streamCount: {
          increment: 1,
        },
      },
    });
  },
};
