import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Addresses = () => {
  const { token, backendUrl, userData, getProfileData, navigate } =
    useContext(ShopContext);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  });

  if (!token) {
    return (
      <div className="border-t pt-14 flex justify-center items-center min-h-[500px]">
        <p className="text-gray-500">Please login to manage addresses</p>
      </div>
    );
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        // Update not available - delete and re-add
        toast.error("Please delete and add a new address instead");
        return;
      } else {
        // Add new address
        await axios.post(
          backendUrl + "/api/user/add-address",
          { address: addressForm },
          { headers: { token } },
        );
        toast.success("Address added");
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        isDefault: false,
      });
      getProfileData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-t pt-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Addresses</h1>
            <p className="text-gray-500 text-sm mt-1">
              Saved delivery locations
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              setEditingAddressId(null);
              setAddressForm({
                street: "",
                city: "",
                state: "",
                zip: "",
                country: "",
                isDefault: false,
              });
            }}
            className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition"
          >
            {showAddressForm ? "Cancel" : "+ Add Address"}
          </button>
        </div>

        {/* Display Addresses */}
        {userData?.addresses && userData.addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {userData.addresses.map((addr) => (
              <div
                key={addr._id}
                className="border rounded-lg p-4 relative hover:shadow-lg transition bg-white"
              >
                {addr.isDefault && (
                  <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                    Default
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-sm text-gray-800">
                    {addr.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-sm text-gray-500">{addr.country}</p>

                  <div className="flex gap-2 mt-4 pt-3 border-t flex-wrap">
                    <button
                      onClick={async () => {
                        try {
                          await axios.post(
                            backendUrl + "/api/user/address/delete",
                            { addressId: addr._id },
                            { headers: { token } },
                          );
                          toast.success("Address deleted");
                          getProfileData();
                        } catch (error) {
                          toast.error(error.message);
                        }
                      }}
                      className="text-sm text-red-600 hover:underline font-semibold"
                    >
                      Delete
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(
                              backendUrl + "/api/user/address/default",
                              { addressId: addr._id },
                              { headers: { token } },
                            );
                            toast.success("Default address updated");
                            getProfileData();
                          } catch (error) {
                            toast.error(error.message);
                          }
                        }}
                        className="text-sm text-blue-600 hover:underline font-semibold"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showAddressForm && (
            <p className="text-gray-500 text-center py-8">No addresses yet</p>
          )
        )}

        {/* Add Address Form */}
        {showAddressForm && (
          <form onSubmit={saveAddress} className="border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">
                  Street Address
                </p>
                <input
                  onChange={handleAddressChange}
                  value={addressForm.street}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="text"
                  name="street"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">City</p>
                <input
                  onChange={handleAddressChange}
                  value={addressForm.city}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="text"
                  name="city"
                  placeholder="New York"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">State</p>
                <input
                  onChange={handleAddressChange}
                  value={addressForm.state}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="text"
                  name="state"
                  placeholder="NY"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">Zip Code</p>
                <input
                  onChange={handleAddressChange}
                  value={addressForm.zip}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="text"
                  name="zip"
                  placeholder="10001"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-700 font-semibold">Country</p>
                <input
                  onChange={handleAddressChange}
                  value={addressForm.country}
                  className="border border-gray-300 rounded px-3.5 py-2 w-full focus:outline-none focus:border-black"
                  type="text"
                  name="country"
                  placeholder="Bangladesh"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <button
              type="submit"
              className="bg-black text-white px-6 py-2 text-sm font-semibold rounded hover:bg-gray-800 transition w-fit mt-6"
            >
              Add Address
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Addresses;
