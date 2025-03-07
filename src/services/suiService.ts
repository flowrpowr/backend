import { Transaction } from "@mysten/sui/transactions";
import {
  ADMIN_KEYPAIR,
  SUI_CLIENT,
  FLOWR_PACKAGE_ID,
  enokiClient,
} from "../config/constants";
import { toBase64, fromBase64 } from "@mysten/bcs";

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
    const txBytes = await tx.build({ client: SUI_CLIENT });
    const signature = (await ADMIN_KEYPAIR.signTransaction(txBytes)).signature;

    const response = await SUI_CLIENT.executeTransactionBlock({
      transactionBlock: txBytes,
      signature,
      options: {
        showEvents: true,
        showObjectChanges: true,
      },
    });

    let suiId = "";
    try {
      suiId = (response.events?.[0]?.parsedJson as any)?.track_id || "";
    } catch (error) {
      console.error("Failed to extract track_id from event:", error);
    }
    let suiDigest = response.digest;
    return { suiDigest, suiId };
  },
  async streamTrack(
    trackSuiId: string,
    paymentCoin: string,
    listenerAddress: string
  ): Promise<{ suiDigest: string }> {
    const tx = new Transaction();
    let streamCoin = tx.object(paymentCoin);
    // 1 STREAM coin
    let payment = tx.splitCoins(streamCoin, [1]);

    // move call to stream_track
    tx.moveCall({
      package: FLOWR_PACKAGE_ID,
      module: "track",
      function: "stream_track",
      arguments: [tx.pure.address(trackSuiId), payment],
    });
    const txBytes = await tx.build({
      client: SUI_CLIENT,
      onlyTransactionKind: true,
    });

    // enoki sponsored transaction
    const sponsored = await enokiClient.createSponsoredTransaction({
      network: "testnet",
      transactionKindBytes: toBase64(txBytes),
      sender: listenerAddress,
      allowedMoveCallTargets: [`${FLOWR_PACKAGE_ID}::flowr::stream_track`],
    });
    const signer = ADMIN_KEYPAIR;
    const { signature } = await signer.signTransaction(
      fromBase64(sponsored.bytes)
    );
    const response = await enokiClient.executeSponsoredTransaction({
      digest: sponsored.digest,
      signature,
    });
    let suiDigest = response.digest;
    return { suiDigest };
  },
};
