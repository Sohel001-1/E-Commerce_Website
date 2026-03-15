import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';

const InquiryBanner = () => {
  const { backendUrl } = useContext(ShopContext);
  
  const [formData, setFormData] = useState({
    contactNumber: '',
    productDetails: '',
    askForPrice: false,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!formData.contactNumber || !formData.productDetails) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('contactNumber', formData.contactNumber);
      data.append('productDetails', formData.productDetails);
      data.append('askForPrice', formData.askForPrice);
      if (image) {
        data.append('image', image);
      }

      const response = await axios.post(`${backendUrl}/api/inquiry/submit`, data);

      if (response.data.success) {
        toast.success(response.data.message || 'Inquiry submitted successfully!');
        setFormData({ contactNumber: '', productDetails: '', askForPrice: false });
        removeImage();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-16 bg-gradient-to-r from-gray-900 to-gray-800 my-10 border-y border-gray-700">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          
          {/* Header Section */}
          <div className="flex-1 text-center lg:text-left text-white">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
              CAN'T FIND WHAT <span className="text-brand-500">YOU'RE LOOKING FOR?</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-6">
              Let us know exactly what part or product you need. Our team will source it from our global network and get back to you with availability and pricing!
            </p>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full max-w-md">
            <form onSubmit={onSubmitHandler} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Contact Number *</label>
                <input
                  required
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={onChangeHandler}
                  placeholder="+8801XXXXXXXXX"
                  className="bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-brand-500 focus:bg-white/10 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Product Details *</label>
                <textarea
                  required
                  rows={3}
                  name="productDetails"
                  value={formData.productDetails}
                  onChange={onChangeHandler}
                  placeholder="Brand, Model, Year, Part Number..."
                  className="bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 outline-none focus:border-brand-500 focus:bg-white/10 transition-colors resize-none scrollbar-thin scrollbar-thumb-white/20"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Reference Photo (Optional)</label>
                {!preview ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-4 cursor-pointer hover:bg-white/5 hover:border-brand-400 transition-colors group">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-400 mb-2 transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                  </label>
                ) : (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/20 bg-black/50">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="askForPrice"
                  name="askForPrice"
                  checked={formData.askForPrice}
                  onChange={onChangeHandler}
                  className="w-4 h-4 text-brand-500 bg-white/5 border-white/20 rounded focus:ring-brand-500 focus:ring-2"
                />
                <label htmlFor="askForPrice" className="text-sm font-semibold text-gray-300 ml-1 cursor-pointer">
                  Ask for Price
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 mt-2 rounded-xl font-bold tracking-widest uppercase transition-all shadow-lg ${isSubmitting ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-brand-500/25 active:scale-[0.98]'}`}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryBanner;
