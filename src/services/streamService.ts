import { dbService } from "./dbService";
import { suiService } from "./suiService";
import { azureService } from "./azureService";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());
// currently returns a signed URL for the frontend to fetch
// TODO: implement actual streaming
export const streamService = {
  async processStream(
    trackId: string,
    listenerAddress: string
  ): Promise<{ signedUrl: string; suiDigest: string }> {
    try {
      // get track from db
      const track = await prisma.track.findUniqueOrThrow({
        where: { id: trackId },
      });
      // get audioBuffer
      let segs = (track.audioUrl as string).split("/");
      let blobName = segs[segs.length - 1];
      let signedUrl = await azureService.generateSignedUrl(blobName);

      // sui payment and stream increment
      let trackSuiId = track.suiId as string;
      const suiDigest = await suiService.streamTrack(
        trackSuiId,
        listenerAddress
      );
      //TODO if for some reason this fails, need to refund
      await dbService.incrementStreamCount(trackId);

      return { signedUrl, suiDigest };
    } catch (error) {
      console.log(`Stream processing failed: ${error}`);
      throw error;
    }
  },
};
