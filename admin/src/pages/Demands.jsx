import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const Demands = ({ token }) => {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDemands = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/inquiry/list", { headers: { token } });
      if (response.data.success) {
        setDemands(response.data.inquiries.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDemand = async (id) => {
    try {
      const response = await axios.post(backendUrl + "/api/inquiry/remove", { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDemands(); // refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [token]);

  return (
    <div className="flex-1 p-8 sm:ml-[18vw]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-gray-700">Customer <span className="text-gray-900">Demands</span></h2>
        <button 
          onClick={fetchDemands}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded shadow text-sm hover:bg-gray-200"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading demands...</p>
      ) : demands.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow border text-center text-gray-500">
          No customer demands found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demands.map((demand, index) => (
            <div key={index} className="bg-white border rounded-xl overflow-hidden shadow hover:shadow-md transition">
              {demand.image ? (
                <div className="h-48 w-full bg-gray-100 overflow-hidden">
                  <img src={demand.image} alt="Reference" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="h-48 w-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-b">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="text-sm">No Photo Provided</span>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {new Date(demand.date).toLocaleDateString()} at {new Date(demand.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className="flex gap-2">
                    {demand.askForPrice && (
                       <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">Price Inquiry</span>
                    )}
                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">{demand.status}</span>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 mt-2">Requested Product:</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3 bg-gray-50 p-3 rounded border" title={demand.productDetails}>
                  "{demand.productDetails}"
                </p>

                <div className="mt-4 pt-4 border-t flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Contact Details</span>
                    <p className="font-medium text-gray-800 break-all">{demand.contactNumber}</p>
                  </div>
                  <button 
                    onClick={() => deleteDemand(demand._id)} 
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors"
                    title="Delete Inquiry"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Demands;
