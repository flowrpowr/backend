import express from "express";

import { Request, Response } from "express";
import { streamService } from "../services/streamService";

const streamRouter = express.Router();

streamRouter.get("/", (req: Request, res: Response) => {
  (async () => {
    try {
      const trackId = req.query.trackId as string;
      const listenerAddress = req.query.listenerAddress as string;
      if (!trackId || !listenerAddress) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields for stream",
        });
      }
      const data = await streamService.processStream(trackId, listenerAddress);

      // Send the buffer
      return res.status(200).send({ success: true, ...data });
    } catch (error) {
      console.error("Stream error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to stream song",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  })();
});

export default streamRouter;
