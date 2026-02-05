import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;





// import mongoose from "mongoose";

// const connectDB = async () => {

//     mongoose.connection.on("connected", () => {
//         console.log("MongoDB connected successfully");
//     })

//     await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)


// }

// export default connectDB;