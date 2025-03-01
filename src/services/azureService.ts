import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadResponse,
} from "@azure/storage-blob";
import dotenv from "dotenv";
import {
  AUDIO_CONTAINER_NAME,
  COVER_CONTAINER_NAME,
} from "../config/constants";

dotenv.config();

// Get environment variables for Azure Storage
const connectionString = process.env.AZ_STORAGE_CN_KEY as string;
if (!connectionString) throw Error("Azure Storage connectionString not found");

// Create BlobServiceClient
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
// Get container clients
const audioContainerClient =
  blobServiceClient.getContainerClient(AUDIO_CONTAINER_NAME);
const coverContainerClient =
  blobServiceClient.getContainerClient(COVER_CONTAINER_NAME);

export const azureService = {
  /**
   * Uploads an audio file to Azure Blob Storage using a provided object ID
   * @param fileBuffer - Buffer containing the audio file data
   * @param mimeType - MIME type of the audio file
   * @param objectId - The Sui blockchain object ID to use as the blob ID
   * @returns URL of the uploaded blob
   */
  async uploadAudioBlob(
    fileBuffer: Buffer,
    mimeType: string,
    artistAddress: string,
    title: string
  ): Promise<string> {
    try {
      // naming blob
      const blobName = `${artistAddress}-${title}.${this.getFileExtension(
        mimeType
      )}`;

      // Get BlockBlobClient
      const blockBlobClient = audioContainerClient.getBlockBlobClient(blobName);

      // Upload data
      const uploadBlobResponse: BlockBlobUploadResponse =
        await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
          blobHTTPHeaders: {
            blobContentType: mimeType,
          },
        });
      // Return the URL of the uploaded blob
      return blockBlobClient.url;
    } catch (error) {
      console.error("Error uploading audio to Azure:", error);
      throw new Error("Failed to upload audio file to Azure storage");
    }
  },

  /**
   * Uploads a cover image to Azure Blob Storage
   * @param imageBuffer - Buffer containing the image data
   * @param mimeType - MIME type of the image
   * @param objectId - Optional blockchain object ID to use as the blob name
   * @returns URL of the uploaded image
   */
  async uploadCoverImage(
    imageBuffer: Buffer,
    mimeType: string,
    artistAddress: string,
    title: string
  ): Promise<string> {
    try {
      const blobName = `${artistAddress}-${title}.${this.getFileExtension(
        mimeType
      )}`;

      // Get BlockBlobClient
      const blockBlobClient = coverContainerClient.getBlockBlobClient(blobName);

      // Upload data
      await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
      });

      // Return the URL of the uploaded image
      return blockBlobClient.url;
    } catch (error) {
      console.error("Error uploading cover to Azure:", error);
      throw new Error("Failed to upload cover image to Azure storage");
    }
  },

  /**
   * Deletes a blob from Azure Storage
   * @param blobUrl - URL of the blob to delete
   * @param isAudio - Whether the blob is an audio file or cover image
   */
  /*async deleteBlob(blobUrl: string, isAudio: boolean = true): Promise<void> {
    try {
      const containerClient = isAudio
        ? audioContainerClient
        : coverContainerClient;
      const blobName = this.getBlobNameFromUrl(blobUrl);

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    } catch (error) {
      console.error("Error deleting blob from Azure:", error);
      throw new Error("Failed to delete blob from Azure storage");
    }
  },*/

  /**
   * Extracts the file extension from a MIME type
   * @param mimeType - MIME type string
   * @returns File extension
   */
  getFileExtension(mimeType: string): string {
    const mimeToExt: { [key: string]: string } = {
      "audio/mpeg": "mp3",
      "audio/mp3": "mp3",
      "audio/wav": "wav",
      "audio/x-wav": "wav",
      "audio/ogg": "ogg",
      "audio/flac": "flac",
      "audio/aac": "aac",
      "audio/m4a": "m4a",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };

    return mimeToExt[mimeType] || "bin";
  },

  /**
   * Extracts the blob name from a URL
   * @param blobUrl - URL of the blob
   * @returns Blob name
   */
  /*getBlobNameFromUrl(blobUrl: string): string {
    const url = new URL(blobUrl);
    const pathSegments = url.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
  },*/
};
