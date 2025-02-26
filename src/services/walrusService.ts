export const walrusService = {
  async storeFile(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<{ objectId: string; blobId: string }> {
    // Simplified version of your walrusPublish function
    const response = await fetch(
      "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=5",
      {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: fileBuffer,
      }
    );

    const data = await response.json();

    return {
      objectId: data.newlyCreated.blobObject.id,
      blobId: data.newlyCreated.blobObject.blobId,
    };
  },
};
