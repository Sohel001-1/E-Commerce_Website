import React from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../utils/animations'

const policies = [
  { icon: assets.exchange_icon, title: 'Easy Exchange Policy', desc: 'We offer hassle free exchange policy' },
  { icon: assets.quality_icon, title: '7 Days Return Policy', desc: 'We provide 7 days free return policy' },
  { icon: assets.support_img, title: 'Best Customer Support', desc: 'We provide 24/7 customer support' },
];

const OurPolicy = () => {
  return (
    <motion.div
      className='flex flex-col sm:flex-row justify-around gap-6 sm:gap-4 text-center py-20 text-xs sm:text-sm md:text-base text-surface-600'
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {policies.map((item, i) => (
        <motion.div
          key={i}
          variants={staggerItem}
          whileHover={{ y: -6, transition: { duration: 0.3 } }}
          className="group p-8 rounded-3xl glass-card-hover cursor-default"
        >
          <motion.img
            src={item.icon}
            className='w-12 m-auto mb-5'
            alt=""
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <p className='font-display font-semibold text-surface-800'>{item.title}</p>
          <p className='text-surface-400 mt-1'>{item.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default OurPolicy
