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
