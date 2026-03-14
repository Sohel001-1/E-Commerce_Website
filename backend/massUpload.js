import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import connectDB from './config/mongodb.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

async function run() {
    await connectDB();
    console.log('Connected to DB');

    const uploadDir = 'C:\\projects\\Japan Autos\\Japan Autos\\upload\\batch3_clean sorted';
    const files = fs.readdirSync(uploadDir);

    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

        const productName = path.basename(file, path.extname(file)).trim();
        console.log(`\nProcessing: "${productName}"`);

        const product = await productModel.findOne({ name: new RegExp('^' + productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });

        if (!product) {
            console.log(`  -> ⚠️ Product not found in DB: "${productName}"`);
            continue;
        }

        if (product.image && product.image.length > 0) {
            console.log(`  -> ⏭️ Skipping: Product already has ${product.image.length} photo(s).`);
            continue;
        }

        console.log(`  -> 🚀 Uploading raw image to Cloudinary...`);
        const filePath = path.join(uploadDir, file);
        try {
            const result = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
            console.log(`  -> ✅ Uploaded URL: ${result.secure_url}`);

            product.image = [result.secure_url];
            await product.save();
            console.log(`  -> 💾 Product updated successfully!`);
        } catch (err) {
            console.error(`  -> ❌ Upload failed for "${productName}":`, err.message);
        }
    }

    console.log('\nAll done.');
    process.exit(0);
}

run().catch(console.error);
