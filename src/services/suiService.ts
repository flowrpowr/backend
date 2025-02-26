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
    genre: string
  ): Promise<string> {
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
        tx.pure.string("still uploading..."),
      ],
    });

    tx.setSender(ADMIN_KEYPAIR.toSuiAddress());
    const bytes = await tx.build();
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
    //delete after testing
    console.log(response.events);
    return response.digest;
  },
};
