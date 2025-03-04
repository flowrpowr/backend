import { dbService } from "./dbService";
import { suiService } from "./suiService";
import { azureService } from "./azureService";
import { Response } from "express";
import { blob } from "stream/consumers";

export const streamService = {
  async processStream(
    trackSuiId: string,
    paymentCoin: string,
    listenerAddress: string
  ) {
    try {
      const suiPromise = suiService.streamTrack(
        trackSuiId,
        paymentCoin,
        listenerAddress
      );
      const dbPromise = dbService.findTrackBySuiId(trackSuiId);
      const [suiDigest, track] = await Promise.all([suiPromise, dbPromise]);
      if (!track) {
        throw new Error("track not found in db");
      }
      const blobName = azureService.getBlobNameFromUrl(track.audioUrl);

      // Get the audio file as a buffer from Azure
      const audioBuffer = await azureService.getAudioBlob(blobName);

      return audioBuffer;
    } catch (error) {
      console.log(`Stream processing failed: ${error}`);
    }
  },
};
