import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;
      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            allOrdersItem.push(item);
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="pt-14">
      <div className="text-2xl mb-6">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-surface-500 text-lg font-display font-semibold">
              No orders yet
            </p>
            <p className="text-surface-400 text-sm mt-2">
              Your order history will appear here
            </p>
          </div>
        ) : (
          <div>
            {orderData.map((item, index) => (
              <div
                key={index}
                className="py-5 border-b border-surface-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-surface-50/50 px-4 -mx-4 rounded-2xl transition-colors"
              >
                <div className="flex items-start gap-5 text-sm">
                  <img
                    className="w-16 sm:w-20 rounded-xl shadow-card object-cover"
                    src={item.image?.[0]}
                    alt=""
                  />
                  <div>
                    <p className="text-base font-display font-semibold text-surface-800">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-surface-600">
                      <p className="text-lg font-bold text-brand-500">
                        {currency}
                        {item.price}
                      </p>
                      <span className="text-surface-300">|</span>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="mt-2 text-surface-400 text-xs">
                      {new Date(item.date).toDateString()} &middot;{" "}
                      {item.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="md:w-1/3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-sm font-semibold text-surface-700">
                      {item.status}
                    </p>
                  </div>
                  <button
                    onClick={loadOrderData}
                    className="btn-secondary text-xs px-5 py-2"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
