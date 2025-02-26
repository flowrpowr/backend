import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export const suiService = {
  async createTrack(
    title: string,
    artistAddress: string,
    genre: string,
    walrusId: string,
    coverUrl: string,
    publishDate: string = new Date().toISOString()
  ): Promise<string> {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
    const admin = Ed25519Keypair.deriveKeypair(
      process.env.WALLET_SECRET_KEY || ""
    );
    const packageId = process.env.PACKAGE_ID || "";

    const tx = new Transaction();
    tx.moveCall({
      package: packageId,
      module: "track",
      function: "create_track",
      arguments: [
        tx.pure.string(title),
        tx.pure.address(artistAddress),
        tx.pure.string(genre),
        tx.pure.string(publishDate),
        tx.pure.string(coverUrl),
        tx.pure.id(walrusId),
      ],
    });

    tx.setSender(admin.toSuiAddress());
    const bytes = await tx.build({ client });
    const signature = (await admin.signTransaction(bytes)).signature;

    const response = await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
    });

    return response.digest;
  },
};
