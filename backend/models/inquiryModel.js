import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  contactNumber: { type: String, required: true },
  productDetails: { type: String, required: true },
  askForPrice: { type: Boolean, default: false },
  image: { type: String, default: "" }, 
  date: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
});

const inquiryModel = mongoose.models.inquiry || mongoose.model("inquiry", inquirySchema);

export default inquiryModel;
