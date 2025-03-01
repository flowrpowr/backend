import { suiService } from "./suiService";
import { dbService } from "./dbService";
import { azureService } from "./azureService";

export const uploadService = {
  async processUpload(
    fileBuffer: Buffer,
    title: string,
    artist: string,
    artistAddress: string,
    genre: string,
    coverArt: Buffer,
    metadata: {
      audioMimeType: string;
      audioFileSize: number;
      audioDuration: number;
      coverMimeType: string;
      coverFileSize: number;
    }
  ) {
    //1. Store files on cloud
    const trackPromise = azureService.uploadAudioBlob(
      fileBuffer,
      metadata.audioMimeType,
      artistAddress,
      title
    );
    const coverPromise = azureService.uploadCoverImage(
      coverArt,
      metadata.coverMimeType,
      artistAddress,
      title
    );
    // run them in parallel, wait for both
    const [azTrackUrl, azCoverUrl] = await Promise.all([
      trackPromise,
      coverPromise,
    ]);

    // 2. Sui object upload
    const { suiDigest, suiId } = await suiService.createTrack(
      title,
      artist,
      artistAddress,
      genre,
      azCoverUrl
    );

    // 3. Store in database

    //lookup user using artist
    const user = await dbService.findOrCreateUser(artistAddress);
    const track = await dbService.createTrack({
      title,
      artist,
      genre,
      coverUrl: azCoverUrl,
      audioUrl: azCoverUrl,
      mimeType: metadata.audioMimeType,
      fileSize: metadata.audioFileSize,
      duration: metadata.audioDuration,
      suiId,
      artistId: user.id,
    });

    return {
      trackId: track.id,
      suiId: suiId,
      suiDigest,
    };
  },
};
