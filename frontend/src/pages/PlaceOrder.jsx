import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", street: "", city: "", state: "", zipcode: "", country: "", phone: "" });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

 const onSubmitHandler = async (e) => {
  e.preventDefault();
  if (!token) return toast.error("Please login to place an order.");

  try {
    let orderItems = [];

    for (const itemId in cartItems) {
      const qty = cartItems[itemId];
      if (qty > 0) {
        const itemInfo = structuredClone(products.find((p) => p._id === itemId));
        if (itemInfo) {
          itemInfo.quantity = qty;
          orderItems.push(itemInfo);
        }
      }
    }

    if (orderItems.length === 0) {
      return toast.error("Your cart is empty.");
    }

    const orderData = {
      address: formData,
      items: orderItems,
      amount: getCartAmount() + delivery_fee,
    };

    switch (method) {
      case "cod": {
        const res = await axios.post(`${backendUrl}/api/order/place`, orderData, {
          headers: { token },
        });
        if (res.data.success) {
          setCartItems({});
          navigate("/orders");
        } else toast.error(res.data.message);
        break;
      }

      case "stripe": {
        const resStripe = await axios.post(`${backendUrl}/api/order/stripe`, orderData, {
          headers: { token },
        });
        if (resStripe.data.success) window.location.replace(resStripe.data.session_url);
        else toast.error(resStripe.data.message);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    toast.error(err.message);
  }
};


  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3"><Title text1={"DELIVERY"} text2={"INFORMATION"} /></div>
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="firstName" value={formData.firstName} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="First name" />
          <input required onChange={onChangeHandler} name="lastName" value={formData.lastName} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Last name" />
        </div>
        <input required onChange={onChangeHandler} name="email" value={formData.email} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="email" placeholder="Email" />
        <input required onChange={onChangeHandler} name="street" value={formData.street} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Street" />
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="city" value={formData.city} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="City" />
          <input required onChange={onChangeHandler} name="state" value={formData.state} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="State" />
        </div>
        <div className="flex gap-3">
          <input required onChange={onChangeHandler} name="zipcode" value={formData.zipcode} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Zipcode" />
          <input required onChange={onChangeHandler} name="country" value={formData.country} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="text" placeholder="Country" />
        </div>
        <input required onChange={onChangeHandler} name="phone" value={formData.phone} className="border border-gray-300 rounded py-1.5 px-3.5 w-full" type="number" placeholder="Phone" />
      </div>
      <div className="mt-8">
        <div className="mt-8 min-w-80"><CartTotal /></div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod("stripe")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-lg">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-500" : ""}`}></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod("cod")} className="flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-lg">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-500" : ""}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4 uppercase">Cash on delivery</p>
            </div>
          </div>
          <div className="w-full text-end mt-8"><button type="submit" className="bg-black text-white px-16 py-3 text-sm rounded-lg uppercase">Place Order</button></div>
        </div>
      </div>
    </form>
  );
};
export default PlaceOrder;