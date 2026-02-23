import 'dotenv/config';
import connectDB from './config/mongodb.js';
import productModel from './models/productModel.js';

const fixTyres = async () => {
    try {
        await connectDB();

        const updateTires = await productModel.updateMany(
            { subCategory: "Tires" },
            { $set: { subCategory: "Tyres" } }
        );
        console.log(`Updated ${updateTires.modifiedCount} products from Tires to Tyres`);

        const updateTireShine = await productModel.updateMany(
            { subCategory: "Tire Shine" },
            { $set: { subCategory: "Tyre Shine" } }
        );
        console.log(`Updated ${updateTireShine.modifiedCount} products from Tire Shine to Tyre Shine`);

        process.exit();
    } catch (error) {
        console.error("Error updating:", error);
        process.exit(1);
    }
}

fixTyres();
