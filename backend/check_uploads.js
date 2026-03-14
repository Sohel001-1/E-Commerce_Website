import mongoose from 'mongoose';
import 'dotenv/config';
import productModel from './models/productModel.js';
import connectDB from './config/mongodb.js';

async function check() {
    await connectDB();
    const productsWithImages = await productModel.find({ image: { $exists: true, $not: {$size: 0} } });
    console.log(`Total products with images currently assigned: ${productsWithImages.length}`);
    process.exit(0);
}

check().catch(console.error);
