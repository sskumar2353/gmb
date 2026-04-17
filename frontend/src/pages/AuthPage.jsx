import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";
import { liveApi } from "../services/liveApi";

const routeByRole = {
  user: "/user/dashboard",
  driver: "/driver",
  admin: "/admin",
};

export default function AuthPage({ mode = "login" }) {
  const nav = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const notify = useAppStore((s) => s.notify);
  const [role, setRole] = useState("user");
  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const role = String(form.get("role") || "user");
    const driverId = Number(form.get("driverId") || 0);
    if (role !== "driver" && password.length < 6) {
      notify("Password must be at least 6 characters", "warning");
      return;
    }
    if (role === "driver" && !/^\d{10}$/.test(password)) {
      notify("For driver login, enter 10-digit phone in password field", "warning");
      return;
    }
    try {
      if (mode === "register" && role !== "user") {
        notify("Registration is available for end users only", "warning");
        return;
      }

      let authData;
      if (mode === "register") {
        authData = await liveApi.registerUser({
          fullName: email.split("@")[0] || "User",
          phone: "9000000000",
          email,
          password,
        });
      } else if (role === "user") {
        authData = await liveApi.loginUser({ email, password });
      } else if (role === "driver") {
        if (!driverId) {
          notify("Enter valid driver ID for driver login", "warning");
          return;
        }
        authData = await liveApi.loginDriver({ driverId, phone: password });
      } else {
        const username = email.includes("@") ? email.split("@")[0] : email;
        authData = await liveApi.loginAdmin({ username, password });
      }

      const user = {
        id: authData.userId,
        name: authData.fullName || email.split("@")[0] || "Demo",
        email: authData.email || email,
        role,
        token: authData.token,
      };
      setUser(user);
      notify(mode === "login" ? `${role} login successful` : `${role} registration successful`, "success");
      nav(routeByRole[role] || "/search");
    } catch (err) {
      notify(err?.response?.data?.message || "Authentication failed", "alert");
    }
  };

  return (
    <Layout>
      <Card className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Login" : "Register"}</h1>
        <form className="space-y-3" onSubmit={submit}>
          {!(mode === "login" && role === "driver") && (
            <Input
              name="email"
              label={mode === "login" && role === "admin" ? "Admin Username or Email" : "Email"}
              type="text"
              required
            />
          )}
          <Input
            name="password"
            label={mode === "login" && role === "driver" ? "Driver Phone Number" : "Password"}
            type="password"
            required
            minLength={mode === "login" && role === "driver" ? 10 : 6}
            placeholder={mode === "login" && role === "driver" ? "Enter registered 10-digit phone" : ""}
          />
          <Input
            name="driverId"
            label="Driver ID"
            type="number"
            required={mode === "login" && role === "driver"}
          />
          {mode === "register" && <Input label="Confirm Password" type="password" required minLength={6} />}
          <Select
            name="role"
            label="Login as"
            defaultValue="user"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">End User</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </Select>
          {mode === "login" && role === "driver" && (
            <p className="text-xs text-[#6B7280]">
              Driver login uses <span className="font-semibold">Driver ID + registered phone number only</span>.
            </p>
          )}
          {mode === "login" && role === "user" && (
            <p className="text-xs text-[#6B7280]">
              Demo user after seed: <span className="font-semibold">demo@greenmiles.in / password</span>.
            </p>
          )}
          <Button className="w-full" type="submit">{mode === "login" ? "Login" : "Create Account"}</Button>
        </form>
        <p className="text-sm text-[#1F2937]">
          {mode === "login" ? "No account?" : "Already have one?"}{" "}
          <Link className="text-gm-green" to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Register" : "Login"}
          </Link>
        </p>
      </Card>
    </Layout>
  );
}