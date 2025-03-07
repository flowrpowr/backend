import express from "express";
import { uploadService } from "../services/uploadService";
import { Request, Response } from "express";
import { release } from "os";

const uploadRouter = express.Router();

uploadRouter.post("/", async (req: Request, res: Response) => {
  //TODO: what if multiple artists? for now just one owner
  try {
    const {
      title,
      release_type: releaseType,
      genre,
      uploader_sui_address: uploaderSuiAddress,
      audio,
      cover_art: coverArt,
      metadata,
    } = req.body;

    // Validate required fields
    if (!audio || !title || !uploaderSuiAddress || !genre || !coverArt) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    // TODO: support more than single later
    if (releaseType != "SINGLE") {
      return res.status(400).json({
        success: false,
        message: "currently only supporting Single release type",
      });
    }
    const audioBuffer = Buffer.from(audio, "base64");
    const coverBuffer = Buffer.from(coverArt, "base64");

    const result = await uploadService.processUpload(
      title,
      releaseType,
      genre,
      uploaderSuiAddress,
      audioBuffer,
      coverBuffer,
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
