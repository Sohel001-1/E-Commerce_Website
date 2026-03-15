import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your brand logo SVG (shared from frontend assets)
const LOGO_PATH = path.resolve(
    __dirname,
    "../../frontend/src/assets/logo.svg"
);

/**
 * Apply watermarks to a product image:
 *  1. Small logo in the bottom-left corner (full opacity)
 *  2. Large semi-transparent logo in the center (~25% opacity)
 *
 * Returns the path to the watermarked image (a NEW temp file).
 * The original file is left untouched to avoid Windows file lock issues.
 *
 * @param {string} imagePath – Absolute path to the uploaded image file
 * @returns {string} – Path to the watermarked output file
 */
const applyWatermark = async (imagePath) => {
    try {
        console.log(`🔧 Watermark: processing ${path.basename(imagePath)}`);

        // Read logo + image into memory
        const logoBuffer = fs.readFileSync(LOGO_PATH);
        const imageBuffer = fs.readFileSync(imagePath);

        // Get metadata
        const metadata = await sharp(imageBuffer).metadata();
        const imgWidth = metadata.width || 800;
        const imgHeight = metadata.height || 800;
        console.log(`🔧 Watermark: image size = ${imgWidth}x${imgHeight}`);

        // ─── Corner logo: ~15% of image width ───
        const cornerSize = Math.round(imgWidth * 0.15);
        const cornerLogo = await sharp(logoBuffer)
            .resize(cornerSize, cornerSize, { fit: "inside" })
            .png()
            .toBuffer();

        // ─── Center watermark: ~40% of image width, 25% opacity ───
        const centerSize = Math.round(imgWidth * 0.6);
        const centerLogoOpaque = await sharp(logoBuffer)
            .resize(centerSize, centerSize, { fit: "inside" })
            .png()
            .toBuffer();

        // Apply 25% opacity by directly modifying alpha channel
        const centerLogoWithOpacity = await sharp(centerLogoOpaque)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { data, info } = centerLogoWithOpacity;
        for (let i = 3; i < data.length; i += 4) {
            data[i] = Math.round(data[i] * 0.25);
        }

        const finalCenterLogo = await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: info.channels,
            },
        })
            .png()
            .toBuffer();

        // ─── Calculate corner position ───
        const padding = Math.round(imgWidth * 0.02);
        const cornerLogoMeta = await sharp(cornerLogo).metadata();
        const cornerTop =
            imgHeight - (cornerLogoMeta.height || cornerSize) - padding;
        const cornerLeft = padding;

        // ─── Composite from buffer ───
        const processedImage = await sharp(imageBuffer)
            .composite([
                {
                    input: finalCenterLogo,
                    gravity: "centre",
                },
                {
                    input: cornerLogo,
                    top: Math.max(0, cornerTop),
                    left: Math.max(0, cornerLeft),
                },
            ])
            .toBuffer();

        // *** FIX: Write to a NEW temp file to avoid Windows file lock ***
        const ext = path.extname(imagePath) || ".png";
        const outPath = path.join(
            os.tmpdir(),
            `wm_${crypto.randomBytes(8).toString("hex")}${ext}`
        );
        fs.writeFileSync(outPath, processedImage);

        console.log(
            `✅ Watermark applied: ${path.basename(imagePath)} → ${path.basename(outPath)} (${processedImage.length} bytes)`
        );
        return outPath;
    } catch (error) {
        console.error(
            `⚠️ Watermark FAILED for ${path.basename(imagePath)}: ${error.message}`
        );
        console.error(error.stack);
        // Return original path so upload continues without watermark
        return imagePath;
    }
};

export default applyWatermark;
