import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);
  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      <div className="flex flex-col gap-3 mt-4 text-sm">
        <div className="flex justify-between text-surface-600">
          <p>Subtotal</p>
          <p className="font-medium">
            {currency} {getCartAmount().toFixed(2)}
          </p>
        </div>
        <hr className="border-surface-100" />

        <div className="flex justify-between text-surface-600">
          <p>Shipping Fee</p>
          <p className="font-medium">
            {currency} {delivery_fee.toFixed(2)}
          </p>
        </div>
        <hr className="border-surface-100" />

        <div className="flex justify-between pt-2">
          <b className="text-surface-900 font-display">Total</b>
          <b className="text-brand-500 text-lg font-display">
            {currency}{" "}
            {(getCartAmount() === 0
              ? 0
              : getCartAmount() + delivery_fee
            ).toFixed(2)}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
