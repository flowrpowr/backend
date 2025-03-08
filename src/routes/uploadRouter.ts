import express from "express";
import { uploadService } from "../services/uploadService";
import { release } from "os";

const uploadRouter = express.Router();

uploadRouter.post("/release", (req, res) => {
  (async () => {
    try {
      const {
        releaseType: releaseType,
        release_title: releaseTitle,
        artistId,
        cover_art: coverArt,
        genre,
        description,
        release_date: releaseDate,
        image_metadata: imageMetadata,
      } = req.body;
      if (
        !releaseTitle ||
        !releaseType ||
        !artistId ||
        !genre ||
        !releaseDate ||
        !coverArt
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }
      //convert cover to buffer
      const coverBuffer = Buffer.from(coverArt, "base64");
      // convert release date from ISO to Date obj
      const parsedReleaseDate = new Date(releaseDate);

      const result = await uploadService.processReleaseUpload(
        releaseType,
        releaseTitle,
        artistId,
        coverBuffer,
        genre,
        description,
        parsedReleaseDate,
        imageMetadata
      );
      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        ...result,
      });
    } catch (error) {
      console.error("Creating release error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create release object",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  })();
});

uploadRouter.post("/track", (req, res) => {
  // Convert to async IIFE to keep async/await functionality
  // did this way bc weird overload issues
  (async () => {
    try {
      const {
        releaseId,
        coverUrl,
        title,
        trackNumber,
        genre,
        artistId,
        audio,
        audioMetadata,
      } = req.body;

      // Validate required fields
      if (
        !audio ||
        !releaseId ||
        !coverUrl ||
        !title ||
        !genre ||
        !artistId ||
        !trackNumber ||
        !audioMetadata
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const audioBuffer = Buffer.from(audio, "base64");
      // call uploadService
      const result = await uploadService.processTrackUpload(
        releaseId,
        coverUrl,
        title,
        genre,
        artistId,
        trackNumber,
        audioBuffer,
        audioMetadata
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
  })();
});

export default uploadRouter;
