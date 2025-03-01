import { uploadService } from "../uploadService";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Convert fs.readFile to Promise-based
const readFile = promisify(fs.readFile);

/**
 * Simple test function to demonstrate the upload service workflow
 * using actual local MP3 and JPG files.
 */
async function testUploadService() {
  try {
    console.log("=== Testing Upload Service with Local Files ===");

    // Sample test files path
    const audioFilePath = path.resolve(__dirname, "./2025-02-25.mp3");
    const coverFilePath = path.resolve(__dirname, "./mbdtf.jpg");

    // Check if test files exist
    if (!fs.existsSync(audioFilePath)) {
      console.error(`Test audio file not found: ${audioFilePath}`);
      console.log(
        "Please place a test MP3 file named test-track.mp3 in the tests directory"
      );
      return;
    }

    if (!fs.existsSync(coverFilePath)) {
      console.error(`Test cover image not found: ${coverFilePath}`);
      console.log(
        "Please place a test JPG file named test-cover.jpg in the tests directory"
      );
      return;
    }

    // Read test files
    console.log("Reading test files...");
    const audioBuffer = await readFile(audioFilePath);
    const coverBuffer = await readFile(coverFilePath);

    console.log(`Audio file size: ${audioBuffer.length} bytes`);
    console.log(`Cover file size: ${coverBuffer.length} bytes`);

    // Test metadata
    const metadata = {
      audioMimeType: "audio/mpeg",
      audioFileSize: audioBuffer.length,
      audioDuration: 180, // 3 minutes in seconds (example value)
      coverMimeType: "image/jpeg",
      coverFileSize: coverBuffer.length,
    };

    // Test track info
    const title = `Test Track ${new Date().toISOString()}`;
    const artist = "Test Artist";
    const artistAddress = "0x123456789abcdef"; // Example Sui address
    const genre = "Electronic";

    console.log("Uploading test track...");
    console.log(`Title: ${title}`);
    console.log(`Artist: ${artist}`);
    console.log(`Genre: ${genre}`);

    // Call the upload service
    const result = await uploadService.processUpload(
      audioBuffer,
      title,
      artist,
      artistAddress,
      genre,
      coverBuffer,
      metadata
    );

    console.log("✅ Upload successful!");
    console.log("Track ID:", result.trackId);
    console.log("Sui ID:", result.suiId);
    console.log("Sui Digest:", result.suiDigest);

    return result;
  } catch (error) {
    console.error("Test failed with error:", error);
    throw error;
  }
}

// Execute the test
(async () => {
  console.log("Starting upload service test...");

  try {
    await testUploadService();
    console.log("Test completed successfully");
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  }
})();
