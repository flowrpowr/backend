import express from "express";
import { uploadService } from "../services/uploadService";
import { Request, Response } from "express";

const uploadRouter = express.Router();

uploadRouter.post("/", async (req: Request, res: Response) => {
  try {
    const {
      audio,
      title,
      artist,
      artist_address: artistAddress,
      genre,
      coverArt,
      metadata,
    } = req.body;

    // Validate required fields
    if (!audio || !title || !artistAddress || !artist || !genre || !coverArt) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const audioBuffer = Buffer.from(audio, "base64");
    const coverBuffer = Buffer.from(coverArt, "base64");

    const result = await uploadService.processUpload(
      audioBuffer,
      title,
      artist,
      artistAddress,
      genre,
      coverArt,
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

export default uploadRouter;
