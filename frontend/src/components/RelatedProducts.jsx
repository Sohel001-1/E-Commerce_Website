import React, { useEffect, useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import Title from './Title';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '../utils/animations';
import { SkeletonGrid } from './Skeleton';

const RelatedProducts = ({category,subCategory}) => {
    const{ products} = useContext(ShopContext);
    const[relatedProducts,setRelated]=useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        if(products.length>0){
            let productsCopy=products.slice();
            productsCopy=productsCopy.filter((item)=>category===item.category);
            productsCopy=productsCopy.filter((item)=>subCategory===item.subCategory);
            setRelated(productsCopy.slice(0,5));
            setLoading(false);
        }
    },[products,category,subCategory])

  return (
    <div className="my-24">
        <motion.div className="text-center text-3xl py-2" {...fadeUp} whileInView={fadeUp.animate} viewport={{ once: true }}>
            <Title text1={'RELATED'} text2={'PRODUCTS'} />
        </motion.div>
        {loading ? (
            <SkeletonGrid count={5} />
        ) : (
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                {relatedProducts.map((item,index)=>(
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} index={index} />
                ))}
            </motion.div>
        )}
    </div>
  )
}

export default RelatedProducts
