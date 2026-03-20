import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Settings = ({ token }) => {
  const [insideFee, setInsideFee] = useState(0);
  const [outsideFee, setOutsideFee] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/settings`);
      if (response.data.success && response.data.settings) {
        setInsideFee(response.data.settings.insideChittagongFee || 0);
        setOutsideFee(response.data.settings.outsideChittagongFee || 0);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/settings`,
        {
          insideChittagongFee: Number(insideFee),
          outsideChittagongFee: Number(outsideFee),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
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

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <h1 className="text-xl font-medium mb-4">Shipping Settings</h1>
      </div>

      <div className="w-full sm:w-[500px]">
        <p className="mb-2">Inside Chittagong Fee</p>
        <input
          className="w-full px-3 py-2 sm:w-[500px] border border-gray-300 rounded"
          type="number"
          placeholder="Inside CTG Fee"
          value={insideFee}
          onChange={(e) => setInsideFee(e.target.value)}
          required
        />
      </div>

      <div className="w-full sm:w-[500px] mt-2">
        <p className="mb-2">Outside Chittagong Fee</p>
        <input
          className="w-full px-3 py-2 sm:w-[500px] border border-gray-300 rounded"
          type="number"
          placeholder="Outside CTG Fee"
          value={outsideFee}
          onChange={(e) => setOutsideFee(e.target.value)}
          required
        />
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="bg-black text-white px-8 py-3 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
};

export default Settings;
