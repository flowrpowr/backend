import { walrusService } from "./walrusService";
import { blockchainService } from "./blockchainService";
import { databaseService } from "./databaseService";

export const uploadService = {
  async processUpload(
    fileBuffer: Buffer,
    title: string,
    artistAddress: string,
    genre: string,
    coverUrl: string = "", // Default empty string if not provided
    metadata: { mimeType: string; fileSize: number }
  ) {
    // 1. Store file on Walrus
    const { objectId, walrusId } = await walrusService.storeFile(
      fileBuffer,
      metadata.mimeType
    );

    // 2. Register on blockchain
    const txDigest = await blockchainService.createTrack(
      title,
      artistAddress,
      genre,
      walrusId, // Pass the objectId as the blobId for the blockchain
      coverUrl,
      new Date().toISOString()
    );

    // 3. Wait for transaction and get the created object
    // In a real implementation, you'd need to extract the track ID from the transaction
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
    const txResult = await client.waitForTransaction({
      digest: txDigest,
      options: { showEffects: true },
    });

    // Extract the track object ID from transaction results
    // This is simplified - you'd need actual parsing logic
    const trackObjectId =
      txResult.effects?.created?.[0]?.reference?.objectId ||
      `0x${Math.random().toString(16).substring(2, 10)}`;

    // 4. Store in database
    const user = await databaseService.findOrCreateUser(artistAddress);

    const track = await databaseService.createTrack({
      title,
      objectId: trackObjectId,
      blobId,
      genre,
      coverUrl,
      mimeType: metadata.mimeType,
      fileSize: metadata.fileSize,
      artistId: user.id,
      onChainObjectId: objectId,
    });

    return {
      trackId: track.id,
      objectId: trackObjectId,
      txDigest,
    };
  },
};
