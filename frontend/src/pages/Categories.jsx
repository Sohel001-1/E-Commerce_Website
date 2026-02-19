import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../utils/animations';
import Title from '../components/Title';
import { CATEGORY_DATA } from '../assets/data';

const Categories = () => {
    return (
        <div className="py-12 bg-[#F9FAFB]">
            <div className="container mx-auto px-3 sm:px-6">
                {/* Header Section */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Title text1={'TOP'} text2={'CATEGORIES'} />
                    <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-2 font-bold">
                        Genuine Automotive Solutions
                    </p>
                </motion.div>

                {/* 2-Column Grid */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-8"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {CATEGORY_DATA.map((cat, index) => (
                        <motion.div
                            variants={fadeUp}
                            key={index}
                            className="group"
                        >
                            <Link
                                to={`/category/${cat.name}`}
                                // Added 'no-underline' to ensure no hidden lines appear
                                className="flex flex-col-reverse sm:flex-row items-center justify-between p-3 sm:p-6 bg-white border border-gray-100 rounded-2xl transition-all duration-500 hover:shadow-lg hover:border-orange-200 h-full relative no-underline overflow-hidden group gap-3 sm:gap-0"
                            >
                                <div className="flex-1 min-w-0 z-10 text-center sm:text-left w-full sm:w-auto sm:pr-4">
                                    <h3 className="text-xs sm:text-base font-bold text-gray-900 uppercase tracking-wide group-hover:text-orange-600 transition-colors truncate">
                                        {cat.name}
                                    </h3>
                                    <div className="w-6 sm:w-8 h-1 bg-orange-500 mt-2 rounded-full transform origin-center sm:origin-left group-hover:scale-x-150 transition-transform duration-300 mx-auto sm:mx-0" />
                                </div>

                                {/* Image Container */}
                                <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-2xl p-2 group-hover:bg-orange-50/50 transition-colors duration-500">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-contain transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
                                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Categories;
