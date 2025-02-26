import { suiService } from "./suiService";
import { dbService } from "./dbService";

export const uploadService = {
  async processUpload(
    fileBuffer: Buffer,
    title: string,
    artistAddress: string,
    genre: string,
    coverUrl: string = "", // Default empty string if not provided
    metadata: { mimeType: string; fileSize: number }
  ) {
    // 1. Store file on cloud
    //const azureResponse = await azureService.uploadBlobs()
    // 2. Register on blockchain
    const txDigest = await suiService.createTrack(
      title,
      artistAddress,
      genre,
      coverUrl,
      new Date().toISOString()
    );

    // Extract the track object ID from transaction results
    // This is simplified - you'd need actual parsing logic
    //const trackObjectId =

    // 4. Store in database
    const user = await dbService.findOrCreateUser(artistAddress);

    const track = await dbService.createTrack({
      title,
      objectId: trackObjectId,
      genre,
      coverUrl,
      mimeType: metadata.mimeType,
      fileSize: metadata.fileSize,
      artistId: user.id,
    });

    return {
      trackId: track.id,
      objectId: trackObjectId,
      txDigest,
    };
  },
};
