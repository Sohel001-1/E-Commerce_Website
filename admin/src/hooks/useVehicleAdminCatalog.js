import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const useVehicleAdminCatalog = (token) => {
  const [vehicleCatalog, setVehicleCatalog] = useState([]);
  const [isVehicleCatalogLoading, setIsVehicleCatalogLoading] = useState(true);

  const loadVehicleCatalog = useCallback(async () => {
    if (!token) {
      setVehicleCatalog([]);
      setIsVehicleCatalogLoading(false);
      return;
    }

    try {
      setIsVehicleCatalogLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/vehicle/admin/catalog`, {
        headers: { token },
      });

      if (data.success) {
        setVehicleCatalog(data.brands || []);
      } else {
        toast.error(data.message || "Failed to load vehicle catalog");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsVehicleCatalogLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadVehicleCatalog();
  }, [loadVehicleCatalog]);

  return {
    vehicleCatalog,
    isVehicleCatalogLoading,
    loadVehicleCatalog,
  };
};

export default useVehicleAdminCatalog;
