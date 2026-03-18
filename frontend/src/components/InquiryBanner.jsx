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
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-10">
      
      {/* Background Container for Split Layout */}
      <div className="absolute inset-0 flex flex-col z-0">
        <div 
          className="flex-1 w-full" 
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="w-full h-full bg-black/10"></div>
        </div>
        <div className="flex-1 w-full bg-white"></div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10 py-12 md:py-20">
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col md:flex-row overflow-hidden border border-gray-100 p-8 md:p-12 gap-10 md:gap-16">
          
          {/* Left Column - Information */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8 leading-[1.2]">
              Can't Find What You're<br/>Looking For?
            </h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#e87a27] flex items-center justify-center text-white text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold mb-1.5 text-sm">Inquire about parts</h4>
                  <p className="text-xs text-gray-600 leading-relaxed pr-4">Add products with descriptions, images, and notes using the form, then proceed to checkout.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#e87a27] flex items-center justify-center text-white text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold mb-1.5 text-sm">Get price quote</h4>
                  <p className="text-xs text-gray-600 leading-relaxed pr-4">We'll process your request, send email updates, and contact if necessary.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#e87a27] flex items-center justify-center text-white text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold mb-1.5 text-sm">Receive your order</h4>
                  <p className="text-xs text-gray-600 leading-relaxed pr-4">Once your order is finalized, we will ship it to you when it's ready.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 w-full relative">
            <div className="hidden md:block absolute -left-8 top-4 bottom-4 w-[1px] bg-gray-100"></div>
            
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-5 w-full">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700">Add Image</label>
                {!preview ? (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-brand-500 transition-colors group bg-white">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-brand-500 mb-1 transition-colors" />
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                  </label>
                ) : (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-800">Part Name (including Contact Number)*</label>
                <input
                  required
                  type="text"
                  name="productDetails"
                  value={formData.productDetails}
                  onChange={onChangeHandler}
                  placeholder="Description of the part, e.g. +8801XXXXXXX"
                  className="bg-white border border-gray-200 text-gray-800 rounded-md px-4 py-2.5 outline-none focus:border-brand-500 transition-colors placeholder-gray-400 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-800">Additional Information</label>
                <textarea
                  required
                  rows={2}
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={onChangeHandler}
                  placeholder="Your vehicle make, model and year, plus contact number"
                  className="bg-white border border-gray-200 text-gray-800 rounded-md px-4 py-2.5 outline-none focus:border-brand-500 transition-colors placeholder-gray-400 text-sm resize-none"
                ></textarea>
              </div>

              <div className="mt-2 flex justify-end md:justify-center lg:justify-end">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => setFormData(prev => ({...prev, askForPrice: true}))}
                  className={`px-8 py-2.5 rounded text-sm font-bold tracking-wide transition-all ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#e87a27] text-white hover:bg-[#d66b1e] hover:shadow-md active:scale-[0.98]'}`}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? 'Submitting...' : 'Ask For Price'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryBanner;
