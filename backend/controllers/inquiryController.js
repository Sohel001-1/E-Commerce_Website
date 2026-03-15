import inquiryModel from "../models/inquiryModel.js";
import { v2 as cloudinary } from "cloudinary";

// API for submitting a new inquiry
const submitInquiry = async (req, res) => {
  try {
    const { contactNumber, productDetails, askForPrice } = req.body;
    const imageFile = req.file;

    if (!contactNumber || !productDetails) {
      return res.json({ success: false, message: "Missing Details" });
    }

    let imageUrl = "";
    if (imageFile) {
      // Upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    }

    const inquiryData = {
      contactNumber,
      productDetails,
      askForPrice: askForPrice === 'true' || askForPrice === true,
      image: imageUrl,
      date: Date.now(),
      status: 'Pending'
    };

    const newInquiry = new inquiryModel(inquiryData);
    await newInquiry.save();

    res.json({ success: true, message: "Inquiry Submitted Successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Optional: API for admin to get all inquiries
const listInquiries = async (req, res) => {
    try {
        const inquiries = await inquiryModel.find({});
        res.json({ success: true, inquiries });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// admin API to delete an inquiry
const removeInquiry = async (req, res) => {
  try {
      const { id } = req.body;
      await inquiryModel.findByIdAndDelete(id);
      res.json({ success: true, message: "Inquiry Deleted" });
  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
}

export { submitInquiry, listInquiries, removeInquiry };
