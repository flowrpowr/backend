import express from "express";

import { Request, Response } from "express";
import { streamService } from "../services/streamService";

const streamRouter = express.Router();

streamRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { trackSuiId, paymentCoin, listenerAddress } = req.body;
    if (!trackSuiId || !paymentCoin || !listenerAddress) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for stream",
      });
    }
    const audioBuffer = await streamService.processStream(
      trackSuiId,
      paymentCoin,
      listenerAddress
    );
    // Set appropriate headers for audio streaming
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer?.length,
    });

    // Send the buffer
    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to stream song",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
