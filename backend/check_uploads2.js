import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import mongoose from 'mongoose';
import productModel from './models/productModel.js';
import connectDB from './config/mongodb.js';

async function run() {
    await connectDB();
    const uploadDir = 'C:\\projects\\Japan Autos\\Japan Autos\\upload\\batch3_clean sorted';
    const files = fs.readdirSync(uploadDir);

    let totalImages = 0;
    let foundInDB = 0;
    let hasImageAssigned = 0;
    let missingImages = [];

    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
        totalImages++;

        const productName = path.basename(file, path.extname(file)).trim();
        const product = await productModel.findOne({ name: new RegExp('^' + productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });

        if (product) {
            foundInDB++;
            if (product.image && product.image.length > 0) {
                hasImageAssigned++;
            } else {
                missingImages.push(productName);
            }
        }
    }

    console.log(`--- Upload Verification ---`);
    console.log(`Total image files in folder: ${totalImages}`);
    console.log(`Products matching file names found in DB: ${foundInDB}`);
    console.log(`Products that actually have an image assigned: ${hasImageAssigned}`);
    console.log(`Products found in DB but missing image: ${missingImages.length}`);
    if (missingImages.length > 0 && missingImages.length <= 10) {
        console.log(`Missing examples: ${missingImages.join(', ')}`);
    } else if (missingImages.length > 10) {
        console.log(`Missing examples (first 10): ${missingImages.slice(0, 10).join(', ')}`);
    }
    
    process.exit(0);
}

run().catch(console.error);
