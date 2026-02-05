import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ SAFE BOOTSTRAP
const startServer = async () => {
  try {
    await connectDB();            // ⬅️ MUST WAIT
    connectCloudinary();

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();




// import express from 'express';
// import cors from 'cors'
// import 'dotenv/config' 
// import connectDB from './config/mongodb.js';
// import connectCloudinary from './config/cloudinary.js';
// import userRouter from './routes/userRoute.js';
// import productRouter from './routes/productRoute.js';


// // App Config

// const app = express();
// const port = process.env.PORT || 4000

// connectDB()
// connectCloudinary()

// // Middlewares
// app.use(express.json())
// app.use(cors())

// // API Endpoints

// app.use('/api/user', userRouter)
// app.use('/api/product', productRouter)

// app.use('/api/user', userRouter)    
// app.get('/', (req, res) => {
//     res.send("API Working")
// })

// app.listen(port, () => console.log(`Server started on port ${port}`))