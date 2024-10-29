import type { NextApiRequest, NextApiResponse } from "next";
import { uploadImage } from "../../api/CloudinaryApi";

interface UploadResponse {
  url?: string;
  error?: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Adjust based on your requirements
    },
  },
};

/**
 * API Route: POST /api/upload
 * Expects a JSON body with:
 * - file: Base64 encoded image string (e.g., data:image/png;base64,...)
 * - filename: Original name of the file
 */
const handler = async (req: NextApiRequest, res: NextApiResponse<UploadResponse>) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { file, filename } = req.body;

  if (!file || !filename) {
    return res.status(400).json({ error: "Both 'file' and 'filename' are required." });
  }

  try {
    // Extract the base64 string without the data URL prefix
    const base64Data = file.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const imageUrl = await uploadImage(buffer, filename);

    return res.status(200).json({ url: imageUrl });
  } catch (error: any) {
    console.error("Upload Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export default handler; 