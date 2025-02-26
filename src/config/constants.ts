import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import dotenv from "dotenv";

dotenv.config();

// Admin keypair for blockchain transactions
export const ADMIN_KEYPAIR = Ed25519Keypair.deriveKeypair(
  process.env.WALLET_SECRET_KEY || ""
);

// Sui blockchain contract IDs
export const FLOWR_PACKAGE_ID = process.env.FLOWR_PACKAGE_ID || "";
export const TRACK_OBJECT_TYPE = process.env.TRACK_OBJECT_TYPE || "";

// API endpoints
export const WALRUS_PUBLISHER_ENDPOINT =
  process.env.WALRUS_PUBLISHER_ENDPOINT ||
  "https://publisher.walrus-testnet.walrus.space";
