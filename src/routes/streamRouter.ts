import express from "express";

import { Request, Response } from "express";
import { suiService } from "../services/suiService";

const streamRouter = express.Router();

streamRouter.get("/", async (req: Request, res: Response) => {
    try {
        const {} = req.body;
    }
    catch {

    }
}