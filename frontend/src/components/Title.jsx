import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
      <p className='text-surface-400 font-display'>
        {text1}{''}
        <span className='font-bold text-surface-800'>{text2}</span>
      </p>
      <p className='w-8 sm:w-12 h-[2px] bg-gradient-to-r from-brand-500 to-orange-300 rounded-full'></p>
    </div>
  )
}

export default Title
