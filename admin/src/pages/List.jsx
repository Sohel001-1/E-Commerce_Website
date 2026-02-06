import React, { useState, useEffect } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { MdDelete } from "react-icons/md";

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')

  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(backendUrl + "/api/product/list")
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
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
  }

  useEffect(() => {
    fetchList();
  }, [])

  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className='flex flex-col md:flex-row justify-between items-center mb-4 gap-3'>
        <p className='font-semibold'>ALL PRODUCT LIST</p>
    
        <input 
          type="text" 
          placeholder="Search by name or category..." 
          className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-64 outline-none focus:border-gray-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {/* List table title */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-1 px-2 border bg-gray-100 text-sm">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>


          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] gap-2 items-center py-2 px-2 border text-sm">
                <img src={item.image && item.image[0]} alt="" className="w-12 h-12 object-cover" />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>${item.price}</p>
                <MdDelete
                  onClick={() => handleRemove(item._id)}
                  className="text-xl cursor-pointer text-red-500 hover:text-red-700"
                />
              </div>
            ))
          ) : (
            <p className='text-center py-10 text-gray-500'>No products found matching "{searchTerm}"</p>
          )}
        </div>
      )}
    </>
  )
}

export default List