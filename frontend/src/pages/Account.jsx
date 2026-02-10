import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Account = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!token) {
    return (
      <div className="border-t pt-14 flex justify-center items-center min-h-[500px]">
        <p className="text-gray-500">Please login to access account settings</p>
      </div>
    );
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const res = await axios.post(
        backendUrl + "/api/user/change-password",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { token } },
      );
      if (res.data.success) {
        toast.success("Password changed successfully");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-t pt-14">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account</p>
        </div>

        <div className="bg-white border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black"
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black"
                placeholder="Enter new password (min 8 characters)"
                minLength="8"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-black"
                placeholder="Confirm new password"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-black text-white px-8 py-3 text-sm font-semibold rounded hover:bg-gray-800 transition w-full"
            >
              UPDATE PASSWORD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
