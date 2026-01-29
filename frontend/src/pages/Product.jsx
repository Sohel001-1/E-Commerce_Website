import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets"; // adjust path to yours

const Product = () => {
  const { productId } = useParams();
  const { products, currency } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size,setSize]=useState('');

  const fetchProductData = () => {
    const found = products?.find((item) => item._id === productId);

    if (found) {
      setProductData(found);
      setImage(found.image?.[0] || "");
    } else {
      setProductData(null);
      setImage("");
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  if (!productData) return <div className="opacity-0" />;

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*----------Product Data----------*/}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/*-----------Product Images-----------*/}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image?.map((item, index) => (
              <img
                key={index}
                onClick={() => setImage(item)}
                src={item}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt={productData.name} />
          </div>
        </div>

        {/*------------Product Info----------*/}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>

          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <p className="pl-2">(122)</p>
          </div>

          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className='mt-5 text-gray-500 md:w-4/5'>
            {productData.description}
          </p>
          <div className ='flex flex-col gap-4 mt-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item,index)=>(
                <button
  key={index}
  onClick={() => setSize(item)}
  className={`border py-2 px-4 ${
    item === size
      ? "border-orange-500 bg-orange-50"
      : "bg-gray-100 hover:border-gray-400"
  }`}
>
  {item}
</button>

              ))}

            </div>

          </div>
          <button className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
