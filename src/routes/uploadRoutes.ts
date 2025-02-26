import express from "express";
import { uploadService } from "../services/uploadService";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const {
      audio,
      title,
      artist_address: artistAddress,
      genre,
      cover_url: coverUrl,
      metadata,
    } = req.body;

    // Validate required fields
    if (!audio || !title || !artistAddress || !genre) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const fileBuffer = Buffer.from(audio, "base64");

    const result = await uploadService.processUpload(
      fileBuffer,
      title,
      artistAddress,
      genre,
      coverUrl || "",
      metadata
    );

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      ...result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
