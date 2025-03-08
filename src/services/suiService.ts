import { Transaction } from "@mysten/sui/transactions";
import {
  ADMIN_KEYPAIR,
  SUI_CLIENT,
  FLOWR_PACKAGE_ID,
  STREAM_COIN_TYPE,
} from "../config/constants";
import { toBase64, fromBase64 } from "@mysten/bcs";
import { EnokiClient } from "@mysten/enoki";

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_SECRET_KEY || "",
});
// TODO: batch all sui transactions
export const suiService = {
  async createTrack(
    releaseType: string,
    releaseTitle: string,
    trackNumber: number,
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
        tx.pure.string(releaseType),
        tx.pure.string(releaseTitle),
        tx.pure.u8(trackNumber),
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
    listenerAddress: string
  ): Promise<string> {
    //TODO: maybe this should be in frontend
    // get payment coin
    //TODO: change this to be the listener... for now its this for MVP
    let result = await SUI_CLIENT.getCoins({
      owner: ADMIN_KEYPAIR.toSuiAddress(),
      coinType: STREAM_COIN_TYPE,
    });
    if (result.data.length < 1) {
      console.log(`listener ${listenerAddress} has no STREAM coins`);
      throw new Error(`listener ${listenerAddress} has no STREAM coins`);
    }
    let paymentCoin = result.data[0].coinObjectId;
    const tx = new Transaction();
    tx.setSender(ADMIN_KEYPAIR.toSuiAddress());

    let streamCoin = tx.object(paymentCoin);
    // 1 STREAM coin
    let [payment] = tx.splitCoins(streamCoin, [1]);
    // move call to stream_track
    tx.moveCall({
      package: FLOWR_PACKAGE_ID,
      module: "track",
      function: "stream_track",
      arguments: [tx.object(trackSuiId), payment],
    });
    const txBytes = await tx.build({
      client: SUI_CLIENT,
    });

    // TODO: do actual enoki sponsored transaction
    /*const sponsored = await enokiClient.createSponsoredTransaction({
      network: "testnet",
      transactionKindBytes: toBase64(txBytes),
      sender: listenerAddress,
      allowedMoveCallTargets: [`${FLOWR_PACKAGE_ID}::track::stream_track`],
    });
    const signer = ADMIN_KEYPAIR;
    const { signature } = await signer.signTransaction(
      fromBase64(sponsored.bytes)
    );
    const response = await enokiClient.executeSponsoredTransaction({
      digest: sponsored.digest,
      signature,
    });
    let suiDigest = response.digest;*/
    const signature = (await ADMIN_KEYPAIR.signTransaction(txBytes)).signature;
    console.log(paymentCoin);
    const response = await SUI_CLIENT.executeTransactionBlock({
      transactionBlock: txBytes,
      signature,
      options: {
        showEvents: true,
        showObjectChanges: true,
      },
    });
    console.log(response.digest);
    return response.digest;
  },
};
