import { Transaction } from "@mysten/sui/transactions";
import {
  ADMIN_KEYPAIR,
  SUI_CLIENT,
  FLOWR_PACKAGE_ID,
} from "../config/constants";

export const suiService = {
  async createTrack(
    title: string,
    artist: string,
    artistAddress: string,
    genre: string,
    coverUrl: string
  ): Promise<{ suiDigest: string; suiId: string }> {
    let publishDate = new Date().toISOString();
    const tx = new Transaction();
    tx.moveCall({
      package: FLOWR_PACKAGE_ID,
      module: "track",
      function: "create_track",
      arguments: [
        tx.pure.string(title),
        tx.pure.string(artist),
        tx.pure.address(artistAddress),
        tx.pure.string(genre),
        tx.pure.string(publishDate),
        tx.pure.string(coverUrl),
      ],
    });

    tx.setSender(ADMIN_KEYPAIR.toSuiAddress());
    const bytes = await tx.build({ client: SUI_CLIENT });
    const signature = (await ADMIN_KEYPAIR.signTransaction(bytes)).signature;

    //TODO: Figure out how to return objectID
    const response = await SUI_CLIENT.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: {
        showEvents: true,
        showObjectChanges: true,
      },
    });
    // Using "any" type - less safe but more concise
    // Using optional chaining with any type
    let suiId = "";
    try {
      suiId = (response.events?.[0]?.parsedJson as any)?.track_id || "";
    } catch (error) {
      console.error("Failed to extract track_id from event:", error);
    }
    let suiDigest = response.digest;
    return { suiDigest, suiId };
  },
};
