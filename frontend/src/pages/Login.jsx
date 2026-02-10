import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        currentState === "Sign Up" ? "/api/user/register" : "/api/user/login";
      const payload =
        currentState === "Sign Up"
          ? { name, email, password }
          : { email, password };
      const { data } = await axios.post(backendUrl + endpoint, payload);
      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.form
        onSubmit={onSubmitHandler}
        className="w-full max-w-md glass-card p-8 sm:p-10 rounded-3xl"
        {...fadeUp}
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-surface-900">{currentState}</h2>
          <div className="w-12 h-[2px] bg-gradient-to-r from-brand-500 to-orange-300 rounded-full mx-auto mt-3" />
        </div>

        <div className="space-y-4">
          {currentState !== "Login" && (
            <motion.input
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className="input-glass"
              placeholder="Full Name"
              required
            />
          )}
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="input-glass"
            placeholder="Email Address"
            required
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className="input-glass"
            placeholder="Password"
            required
          />
        </div>

        <div className="flex justify-between text-sm mt-4 text-surface-500">
          <button type="button" className="hover:text-brand-500 transition-colors">
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentState(currentState === "Login" ? "Sign Up" : "Login")
            }
            className="hover:text-brand-500 transition-colors font-medium"
          >
            {currentState === "Login" ? "Create account" : "Login Here"}
          </button>
        </div>

        <motion.button
          disabled={loading}
          className="btn-primary btn-shimmer w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading
            ? "Loading..."
            : currentState === "Login"
              ? "Sign In"
              : "Sign Up"}
        </motion.button>
      </motion.form>
    </div>
  );
};
export default Login;
