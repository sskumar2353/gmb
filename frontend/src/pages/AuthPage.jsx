import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";
import { liveApi } from "../services/liveApi";
import { useState } from "react";

const routeByRole = {
  user: "/user/dashboard",
  driver: "/driver",
  admin: "/admin",
};

export default function AuthPage({ mode = "login" }) {
  const nav = useNavigate();
  const location = useLocation();
  const setUser = useAppStore((s) => s.setUser);
  const notify = useAppStore((s) => s.notify);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const search = new URLSearchParams(location.search);
  const sessionExpired = mode === "login" && search.get("reason") === "session_expired";

  const getFieldErrors = (err) => {
    const data = err?.response?.data?.data;
    if (!data) return {};
    if (data.fields && typeof data.fields === "object") return data.fields;
    if (typeof data === "object") return data;
    return {};
  };

  const submit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    if (password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters" });
      notify("Password must be at least 6 characters", "warning");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      notify("Passwords do not match", "warning");
      return;
    }
    try {
      let authData;
      if (mode === "register") {
        authData = await liveApi.registerUser({
          fullName: email.split("@")[0] || "User",
          phone: "9000000000",
          email,
          password,
        });
      } else {
        authData = await liveApi.loginUser({ email, password });
      }

      const resolvedRole =
        authData.userId === 0
          ? "admin"
          : String(authData.email || "").startsWith("driver-")
            ? "driver"
            : "user";

      const user = {
        id: authData.userId,
        name: authData.fullName || email.split("@")[0] || "Demo",
        email: authData.email || email,
        role: resolvedRole,
        token: authData.token,
        refreshToken: authData.refreshToken || null,
      };
      setUser(user);
      notify(mode === "login" ? `${resolvedRole} login successful` : "user registration successful", "success");
      nav(routeByRole[resolvedRole] || "/search");
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      notify(err?.response?.data?.message || "Authentication failed", "alert");
    }
  };

  return (
    <Layout>
      <Card className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Login" : "Register"}</h1>
        {sessionExpired ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Session expired. Please login again.
          </div>
        ) : null}
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <Input
              name="email"
              label="Email / Username"
              type="text"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={fieldErrors.email ? "border-red-400" : ""}
              placeholder={mode === "login" ? "Enter email or username" : "name@example.com"}
            />
            {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
          </div>
          <div>
            <Input
              name="password"
              label="Password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={fieldErrors.password ? "border-red-400" : ""}
            />
            {fieldErrors.password ? <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p> : null}
          </div>
          {mode === "register" && (
            <div>
              <Input
                label="Confirm Password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={fieldErrors.confirmPassword ? "border-red-400" : ""}
              />
              {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p> : null}
            </div>
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