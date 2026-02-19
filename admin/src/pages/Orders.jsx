import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const currency = "৳";   // ✅ BDT currency ONLY for Orders page


const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    bestSeller: "N/A"
  });

  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const response = await axios.post(backendUrl + "/api/order/list", {}, { headers: { token } });
      if (response.data.success) {
        const allOrders = response.data.orders.reverse();
        setOrders(allOrders);
        setFilteredOrders(allOrders);

        // Calculate Revenue
        const revenue = allOrders.reduce((acc, curr) => acc + curr.amount, 0);

        // Calculate Best Seller
        const productCounts = {};
        allOrders.forEach(order => {
          order.items.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
          });
        });

        const topProduct = Object.keys(productCounts).length > 0
          ? Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b)
          : "N/A";

        setStats({
          totalRevenue: revenue,
          totalOrders: allOrders.length,
          bestSeller: topProduct
        });

      } else {
        toast.error(response.data.message);
      }
    } catch (error) { toast.error(error.message) }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + "/api/order/status", { orderId, status: event.target.value }, { headers: { token } });
      if (response.data.success) {
        toast.success("Status Updated");
        await fetchAllOrders();
      }
    } catch (error) { toast.error(error.message) }
  };

  const exportToCSV = () => {
    const headers = "Order ID,Date,Customer,Amount,Status\n";
    const rows = orders.map(o => `${o._id},${new Date(o.date).toLocaleDateString()},${o.address.firstName} ${o.address.lastName},${o.amount},${o.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orders_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { bg-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JAPAN AUTOS - INVOICE</h1>
            <p>Order ID: ${order._id}</p>
            <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
          </div>
          <div class="details">
            <h3>Customer Details:</h3>
            <p>${order.address.firstName} ${order.address.lastName}<br>
            ${order.address.street}<br>
            ${order.address.city}, ${order.address.state}, ${order.address.zipcode}<br>
            Phone: ${order.address.phone}</p>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Size</th><th>Quantity</th><th>Price</th></tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.size}</td>
                  <td>${item.quantity}</td>
                  <td>${currency}${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">Total Amount: ${currency}${order.amount}</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    let temp = orders;
    if (filterStatus !== "All") temp = temp.filter(o => o.status === filterStatus);
    if (searchTerm) {
      temp = temp.filter(o => o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.address.firstName + " " + o.address.lastName).toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredOrders(temp);
  }, [searchTerm, filterStatus, orders]);

  useEffect(() => { fetchAllOrders() }, [token]);

  return (
    <div className="w-full p-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl text-gray-800">Order Management</h3>
        <button onClick={exportToCSV} className="bg-black text-white px-4 py-1.5 text-sm rounded hover:bg-gray-800">
          Export CSV
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500 text-xs uppercase font-semibold">Total Revenue</p>
          <h2 className="text-2xl font-bold text-green-600">{currency}{stats.totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500 text-xs uppercase font-semibold">Total Orders</p>
          <h2 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h2>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500 text-xs uppercase font-semibold text-blue-600">Best Seller</p>
          <h2 className="text-xl font-bold text-blue-700 truncate" title={stats.bestSeller}>{stats.bestSeller}</h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <input
          type="text" placeholder="Search by ID or Name..."
          className="flex-1 p-2 border border-gray-300 rounded outline-none text-sm"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border border-gray-300 rounded text-sm bg-white">
          <option value="All">All Statuses</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Packing">Packing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border border-gray-200 p-5 text-xs sm:text-sm bg-white rounded-lg shadow-sm">
            <img className="w-12" src={assets.parcel_icon} alt="Parcel" />

            {/* Column 1: Items & Address */}
            <div>
              <div className="mb-3">
                {order.items.map((item, i) => (
                  <p key={i} className="font-semibold text-gray-900">
                    {item.name} x {item.quantity} <span className="text-gray-400">({item.size})</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 font-bold">{order.address.firstName} {order.address.lastName}</p>
              <p className="text-gray-500">{order.address.street}, {order.address.city}, {order.address.state}, {order.address.zipcode}</p>
              <p className="mt-1 font-medium text-blue-600">{order.address.phone}</p>
            </div>

            {/* Column 2: Payment & Date */}
            <div>
              <p>Items: {order.items.length}</p>
              <p className="mt-2 text-gray-600">Method: {order.paymentMethod}</p>
              <p>Payment: <span className={order.payment ? "text-green-600 font-bold" : "text-orange-500 font-bold"}>{order.payment ? "Done" : "Pending"}</span></p>
              <p className="mt-1 text-gray-400">Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            {/* Column 3: Total & Print */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-lg text-gray-800">{currency}{order.amount}</p>
              <button
                onClick={() => printInvoice(order)}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300 hover:bg-gray-200"
              >
                Print Invoice
              </button>
            </div>

            {/* Column 4: Status Selector & Tracking */}
            <div className="flex flex-col gap-2">
              <select
                className="p-2 border border-gray-300 rounded cursor-pointer font-medium"
                onChange={(e) => statusHandler(e, order._id)}
                value={order.status}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {["Shipped", "Delivered"].includes(order.status) && (
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Tracking URL"
                    defaultValue={order.trackingUrl || ""}
                    className="p-1 border border-gray-300 rounded text-xs flex-1"
                    onBlur={(e) => {
                      // Only save if changed
                      if (e.target.value !== order.trackingUrl) {
                        // Call update tracking API
                        axios.post(backendUrl + "/api/order/tracking", { orderId: order._id, trackingUrl: e.target.value }, { headers: { token } })
                          .then(res => {
                            if (res.data.success) toast.success("Tracking Updated");
                            else toast.error(res.data.message);
                          })
                          .catch(err => toast.error(err.message));
                      }
                    }}
                  />
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:text-blue-800" title="Test Link">
                      🔗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-300">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;