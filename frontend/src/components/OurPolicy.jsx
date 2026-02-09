import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'

const policies = [
  { icon: assets.exchange_icon, title: 'Easy Exchange Policy', desc: 'We offer hassle free exchange policy' },
  { icon: assets.quality_icon, title: '7 Days Return Policy', desc: 'We provide 7 days free return policy' },
  { icon: assets.support_img, title: 'Best Customer Support', desc: 'We provide 24/7 customer support' },
];

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-8 sm:gap-4 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
      {policies.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          whileHover={{ y: -5 }}
          className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-500"
        >
          <motion.img
            src={item.icon}
            className='w-12 m-auto mb-5'
            alt=""
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <p className='font-semibold text-gray-800'>{item.title}</p>
          <p className='text-gray-400 mt-1'>{item.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default OurPolicy
