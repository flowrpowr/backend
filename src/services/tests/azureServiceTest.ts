import { azureService } from "../azureService";
import * as fs from "fs";
import { promisify } from "util";

// Convert fs.readFile to Promise-based
const readFile = promisify(fs.readFile);

/**
 * Simple test function to demonstrate uploading an audio file
 */
async function testAudioUpload() {
  try {
    // Example parameters
    const filePath = "./2025-02-25.mp3"; // Path to a test audio file
    const mimeType = "audio/mpeg";
    const suiId = "test-sui-id-" + Date.now(); // Generate a unique ID

    console.log("Reading test file...");
    const fileBuffer = await readFile(filePath);

    console.log("Uploading audio file to Azure...");
    console.log(`File size: ${fileBuffer.length} bytes`);
    console.log(`MIME type: ${mimeType}`);
    console.log(`SUI ID: ${suiId}`);

    // Call the upload function
    const blobUrl = await azureService.uploadAudioBlob(
      fileBuffer,
      mimeType,
      suiId
    );

    console.log("Upload successful!");
    console.log(`Uploaded blob URL: ${blobUrl}`);

    return blobUrl;
  } catch (error) {
    console.error("Test failed with error:", error);
    throw error;
  }
}

/**
 * Simple test function to demonstrate uploading a cover image
 */
/*async function testCoverImageUpload() {
  try {
    // Example parameters
    const filePath = "./test-samples/sample-cover.jpg"; // Path to a test image file
    const mimeType = "image/jpeg";
    const objectId = "test-cover-id-" + Date.now(); // Generate a unique ID

    console.log("Reading test image file...");
    const fileBuffer = await readFile(filePath);

    console.log("Uploading cover image to Azure...");
    console.log(`File size: ${fileBuffer.length} bytes`);
    console.log(`MIME type: ${mimeType}`);

    // Call the upload function
    const blobUrl = await azureService.uploadCoverImage(
      fileBuffer,
      mimeType,
      objectId
    );

    console.log("Cover image upload successful!");
    console.log(`Uploaded blob URL: ${blobUrl}`);

    return blobUrl;
  } catch (error) {
    console.error("Test failed with error:", error);
    throw error;
  }
}*/

// Execute the tests
(async () => {
  console.log("Starting Azure upload tests...");

  try {
    // Test audio upload
    console.log("\n=== Testing Audio Upload ===");
    const audioUrl = await testAudioUpload();

    // Test cover image upload
    //console.log("\n=== Testing Cover Image Upload ===");
    //const imageUrl = await testCoverImageUpload();

    console.log("\n=== All tests completed successfully ===");
    console.log("Audio URL:", audioUrl);
    //console.log("Cover Image URL:", imageUrl);
  } catch (error) {
    console.error("\n=== Test execution failed ===");
  }
})();
