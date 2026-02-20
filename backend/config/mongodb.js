import mongoose from "mongoose";
import dns from "dns";

// Fix for Node.js DNS resolution issues with MongoDB SRV records on some local networks
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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