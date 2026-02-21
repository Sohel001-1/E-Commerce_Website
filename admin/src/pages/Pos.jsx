import React, { useState, useEffect } from "react";
import { backendUrl } from "../App";
import axios from "axios";
import { toast } from "react-toastify";

const Pos = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchList = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backendUrl + "/api/product/list");
            if (response.data.success) {
                setProducts(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            if (existing.quantity + 1 > product.stock) {
                return toast.error(`Cannot exceed available stock (${product.stock})`);
            }
            setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            if (product.stock < 1) return toast.error("Out of stock");
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const cartTotal = cart.reduce((total, item) => {
        const activePrice = item.salePrice > 0 ? item.salePrice : item.price;
        return total + (activePrice * item.quantity);
    }, 0);

    const checkout = async () => {
        if (cart.length === 0) return toast.error("Cart is empty");

        try {
            const response = await axios.post(
                backendUrl + "/api/order/physical",
                {
                    items: cart,
                    amount: cartTotal,
                    paymentMethod: "Physical POS"
                },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                setCart([]);
                fetchList(); // refresh stock
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[80vh]">
            {/* Products List */}
            <div className="w-full md:w-2/3 border rounded p-4 flex flex-col bg-white">
                <h2 className="text-xl font-bold mb-4">Point of Sale</h2>
                <input
                    type="text"
                    placeholder="Search products..."
                    className="border p-2 rounded mb-4 w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] md:max-h-none">
                    {filteredProducts.map(p => (
                        <div key={p._id} className="border p-3 rounded cursor-pointer hover:shadow-md transition flex flex-col" onClick={() => addToCart(p)}>
                            <img src={p.image?.[0]} className="w-full h-32 object-contain rounded mb-2 bg-gray-50" />
                            <p className="font-medium text-sm line-clamp-2" title={p.name}>{p.name}</p>
                            <div className="mt-auto pt-2 flex justify-between items-center text-sm">
                                {p.salePrice > 0 ? (
                                    <div className="flex flex-col">
                                        <span className="font-bold text-red-600">৳{p.salePrice}</span>
                                        <span className="text-gray-400 line-through text-xs">৳{p.price}</span>
                                    </div>
                                ) : (
                                    <span className="font-bold">৳{p.price}</span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-xs ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    Stock: {p.stock}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart side */}
            <div className="w-full md:w-1/3 border rounded p-4 flex flex-col bg-gray-50">
                <h2 className="text-xl font-bold mb-4">Current Order</h2>
                <div className="flex-1 overflow-y-auto max-h-[30vh] md:max-h-none">
                    {cart.length === 0 ? <p className="text-gray-500 text-center mt-10">Cart is empty</p> : null}
                    {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center border-b py-2 text-sm">
                            <div className="w-7/12 pr-2">
                                <p className="truncate font-medium">{item.name}</p>
                                <p className="text-gray-500">
                                    ৳{item.salePrice > 0 ? item.salePrice : item.price} x {item.quantity}
                                </p>
                            </div>
                            <div className="flex items-center justify-end gap-2 w-5/12">
                                <span className="font-bold">৳{(item.salePrice > 0 ? item.salePrice : item.price) * item.quantity}</span>
                                <button onClick={() => removeFromCart(item._id)} className="text-red-500 font-bold px-2 py-1 bg-red-100 rounded hover:bg-red-200">X</button>
                            </div>             </div>

                    ))}
                </div>
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg mb-4">
                        <span>Total:</span>
                        <span>৳{cartTotal}</span>
                    </div>
                    <button onClick={checkout} disabled={cart.length === 0} className="w-full bg-black text-white font-bold py-3 rounded hover:bg-gray-800 disabled:bg-gray-400">
                        COMPLETE SALE
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Pos;
