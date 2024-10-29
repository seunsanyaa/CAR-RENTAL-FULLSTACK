import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";

const CLOUDINARY_API_BASE_URL = "https://api.cloudinary.com/v1_1";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Generates a signature required for authenticated uploads to Cloudinary.
 * @param params Parameters to include in the signature.
 * @returns The generated signature string.
 */
const generateSignature = (params: Record<string, any>): string => {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  const signature = crypto
    .createHash("sha1")
    .update(sortedParams + CLOUDINARY_API_SECRET)
    .digest("hex");
  return signature;
};

/**
 * Uploads an image buffer to Cloudinary.
 * @param buffer The image buffer to upload.
 * @param filename The original filename of the image.
 * @returns The URL of the uploaded image.
 */
export const uploadImage = async (buffer: Buffer, filename: string): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary configuration is missing.");
  }

  const url = `${CLOUDINARY_API_BASE_URL}/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
  };

  const signature = generateSignature(paramsToSign);

  const formData = new FormData();
  formData.append("file", buffer, { filename });
  formData.append("api_key", CLOUDINARY_API_KEY!);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  try {
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });
    return response.data.secure_url;
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error.response?.data || error.message);
    throw new Error("Image upload failed.");
  }
};
