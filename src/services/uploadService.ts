import { suiService } from "./suiService";
import { azureService } from "./azureService";
import { ReleaseType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const uploadService = {
  async processReleaseUpload(
    type: ReleaseType,
    title: string,
    artistId: string,
    coverBuffer: Buffer,
    genre: string,
    description: string = "", // Optional parameter
    releaseDate: Date = new Date(), // Default to current date if not provided
    imageMetadata: {
      mimeType: string;
      fileSize: number;
    }
  ) {
    try {
      // 1. upload cover art to azure
      const coverUrl = await azureService.uploadCoverImage(
        coverBuffer,
        imageMetadata.mimeType,
        artistId,
        title
      );
      // 2. create release in db
      const release = await prisma.release.create({
        data: {
          title,
          type,
          genre,
          description,
          coverUrl,
          artistId,
          releaseDate,
          updatedAt: new Date(),
        },
      });

      return { releaseId: release.id, coverUrl: release.coverUrl };
    } catch (error) {
      console.error("Error creating release:", error);
      throw error;
    }
  },
  async processTrackUpload(
    releaseId: string,
    coverUrl: string,
    title: string,
    genre: string,
    artistId: string,
    trackNumber: number,
    audioBuffer: Buffer,
    audioMetadata: {
      mimeType: string;
      fileSize: number;
      duration: number;
    }
  ) {
    // 0. get this track's release
    const releasePromise = prisma.release.findUnique({
      where: { id: releaseId },
      include: { Artist: { select: { username: true, walletAddress: true } } },
    });

    //1. Store audio on cloud
    const trackPromise = azureService.uploadAudioBlob(
      audioBuffer,
      audioMetadata.mimeType,
      artistId,
      title
    );
    // run them in parallel, wait for both
    const [release, azTrackUrl] = await Promise.all([
      releasePromise,
      trackPromise,
    ]);

    // 2. Sui object upload
    // TODO: add artists names (potentially multiple)
    let artistName = release?.Artist.username as string;
    let releaseType = release?.type as string;
    let releaseTitle = release?.title as string;
    let artistAddress = release?.Artist.walletAddress as string;
    const { suiDigest, suiId } = await suiService.createTrack(
      releaseType,
      releaseTitle,
      trackNumber,
      title,
      artistName,
      artistAddress,
      genre,
      coverUrl
    );

    // 3. Store in database
    const track = await prisma.track.create({
      data: {
        title,
        artistId,
        genre,
        audioUrl: azTrackUrl,
        mimeType: audioMetadata.mimeType,
        fileSize: audioMetadata.fileSize,
        duration: audioMetadata.duration,
        suiId,
        releaseId,
        trackNumber,
        updatedAt: new Date(),
      },
    });

    return {
      trackId: track.id,
      suiId: suiId,
      suiDigest,
    };
  },
};
