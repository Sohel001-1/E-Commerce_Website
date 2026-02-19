
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../utils/animations';
import Title from '../components/Title';
import { CATEGORY_DATA } from '../assets/data';
import { subCategories } from '../assets/subCategories';
import { assets } from '../assets/assets';

const SubCategories = () => {
    const { categoryName } = useParams();

    // Find the parent category to get its image (as fallback/theme)
    const parentCategory = CATEGORY_DATA.find(cat => cat.name === categoryName);
    const categoryImage = parentCategory ? parentCategory.image : assets.logo; // Fallback

    const currentSubCategories = subCategories[categoryName] || [];

    return (
        <div className="py-12 bg-[#F9FAFB]">
            <div className="container mx-auto px-3 sm:px-6">
                {/* Header Section */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Title text1={categoryName.toUpperCase()} text2={'SUBCATEGORIES'} />
                    <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-2 font-bold">
                        Explore specific parts for {categoryName}
                    </p>
                </motion.div>

                {/* 2-Column Grid (Same design as Categories) */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-8"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {currentSubCategories.length > 0 ? (
                        currentSubCategories.map((sub, index) => (
                            <motion.div
                                variants={fadeUp}
                                key={index}
                                className="group"
                            >
                                <Link
                                    to={`/collection?category=${categoryName}&subCategory=${sub}`}
                                    className="flex flex-col-reverse sm:flex-row items-center justify-between p-3 sm:p-6 bg-white border border-gray-100 rounded-2xl transition-all duration-500 hover:shadow-lg hover:border-orange-200 h-full relative no-underline overflow-hidden group gap-3 sm:gap-0"
                                >
                                    <div className="flex-1 min-w-0 z-10 text-center sm:text-left w-full sm:w-auto sm:pr-4">
                                        <h3 className="text-xs sm:text-base font-bold text-gray-900 uppercase tracking-wide group-hover:text-orange-600 transition-colors truncate">
                                            {sub}
                                        </h3>
                                        <div className="w-6 sm:w-8 h-1 bg-orange-500 mt-2 rounded-full transform origin-center sm:origin-left group-hover:scale-x-150 transition-transform duration-300 mx-auto sm:mx-0" />
                                    </div>

                                    {/* Image Container - Reusing parent category image as visual anchor since we don't have individual subcat images */}
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-2xl p-2 group-hover:bg-orange-50/50 transition-colors duration-500">
                                        <img
                                            src={categoryImage}
                                            alt={sub}
                                            className="w-full h-full object-contain transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
                                            style={{ imageRendering: '-webkit-optimize-contrast' }}
                                        />
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center text-gray-500">
                            No subcategories found for this category.
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default SubCategories;
