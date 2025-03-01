// test-sui-service.ts
import { suiService } from "../suiService";

// Test input values
const testData = {
  title: "Porcupines",
  artist: "Marcus.",
  artistAddress:
    "0xbda19a664d50a5228334aecd3248230427622a5caba9adf953361c18840f7f65",
  genre: "Alternative",
};

// Function to test the suiService.createTrack
async function testCreateTrack() {
  console.log("Testing suiService.createTrack with data:", testData);

  try {
    const result = await suiService.createTrack(
      testData.title,
      testData.artist,
      testData.artistAddress,
      testData.genre
    );

    console.log("Success! Result:", result);
    return result;
  } catch (error) {
    console.error("Error testing createTrack:", error);
    throw error;
  }
}

// Run the test
testCreateTrack()
  .then(() => console.log("Test completed"))
  .catch((err) => console.error("Test failed with error:", err))
  .finally(() => process.exit());
