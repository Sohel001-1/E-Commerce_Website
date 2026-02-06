import React, { useState, useEffect } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { MdDelete } from "react-icons/md";


const List = ({ token }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    try{
      setLoading(true)
      const response = await axios.get(backendUrl + "/api/product/list")
      if(response.data.success){
        setList(response.data.products);
      }else{
        toast.error(response.data.message);
      }
    }catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false)
    }

  }

  const handleRemove = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList();
  },[])

  return (
    <>
      <p className='mb-2'>ALL PRODUCT LIST</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {/* List table title */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-1 px-2 border bg-gray-100 mb-2 text-sm">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>

          {/* Product rows */}
          {list.map((item, index) => (
            <div key={index} className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-2 px-2 border text-sm">
              <img src={item.image && item.image[0]} alt="" className="w-12 h-12 object-cover" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
             <MdDelete
  onClick={() => handleRemove(item._id)}
  className="text-xl cursor-pointer text-red-500 hover:text-red-700"
/>

            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default List
