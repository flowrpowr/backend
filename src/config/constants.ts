import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import dotenv from "dotenv";
import path from "path";

// Configure dotenv to look for .env file in the project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Sui
export const ADMIN_KEYPAIR = Ed25519Keypair.deriveKeypair(
  process.env.SUI_ADMIN_KEY || ""
);
export const SUI_RPC_URL =
  process.env.NODE_ENV === "production"
    ? "https://fullnode.mainnet.sui.io:443"
    : "https://fullnode.testnet.sui.io:443";
export const SUI_CLIENT = new SuiClient({ url: SUI_RPC_URL });

//Sui smart contracts
export const FLOWR_PACKAGE_ID =
  "0xc5e2ac369866cea198b7ae9e94ecf2050b3f04497fea8ce31caea9b253e8c3e4";

//Azure
export const AUDIO_CONTAINER_NAME = process.env.AUDIO_CONTAINER_NAME || "";
export const COVER_CONTAINER_NAME = process.env.COVER_CONTAINER_NAME || "";
