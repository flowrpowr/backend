import { suiService } from "./suiService";
import { dbService } from "./dbService";
import { azureService } from "./azureService";

export const uploadService = {
  async processUpload(
    title: string,
    releaseType: string,
    genre: string,
    uploaderSuiAddress: string,
    audioBuffer: Buffer,
    coverBuffer: Buffer,
    metadata: {
      audioMimeType: string;
      audioFileSize: number;
      audioDuration: number;
      coverMimeType: string;
      coverFileSize: number;
    }
  ) {
    // 0. check if this uploader exists
    const user = await dbService.findUser(uploaderSuiAddress);

    //1. Store files on cloud
    const trackPromise = azureService.uploadAudioBlob(
      audioBuffer,
      metadata.audioMimeType,
      uploaderSuiAddress,
      title
    );
    const coverPromise = azureService.uploadCoverImage(
      coverBuffer,
      metadata.coverMimeType,
      uploaderSuiAddress,
      title
    );
    // run them in parallel, wait for both
    const [azTrackUrl, azCoverUrl] = await Promise.all([
      trackPromise,
      coverPromise,
    ]);

    // 2. Sui object upload
    // TODO: add artists names (potentially multiple)
    let artistName = user.username;
    const { suiDigest, suiId } = await suiService.createTrack(
      title,
      artistName,
      uploaderSuiAddress,
      genre,
      azCoverUrl
    );

    // 3. Store in database
    // TODO: also create a release..?
    const track = await dbService.createTrack({
      title,
      artistId: user.id,
      genre,
      coverUrl: azCoverUrl,
      audioUrl: azCoverUrl,
      mimeType: metadata.audioMimeType,
      fileSize: metadata.audioFileSize,
      duration: metadata.audioDuration,
      suiId,
    });

    return {
      trackId: track.id,
      suiId: suiId,
      suiDigest,
    };
  },
};
