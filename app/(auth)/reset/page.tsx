"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-provider";
import axiosInstance from "@/utils/axiosInstance";

function Page() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First check URL parameters
      const code = searchParams.get("code");
      const refreshTokenParam = searchParams.get("refresh_token");

      if (code && refreshTokenParam) {
        setAccessToken(code);
        setRefreshToken(refreshTokenParam);
      } else {
        // If not in URL params, check hash
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const tokens = {
            accessToken: params.get('access_token'),
            refreshToken: params.get('refresh_token'),
            expiresAt: params.get('expires_at'),
            expiresIn: params.get('expires_in'),
            tokenType: params.get('token_type'),
            type: params.get('type')
          };

          if (tokens.accessToken) {
            setAccessToken(tokens.accessToken);
            setRefreshToken(tokens.refreshToken);
          }
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Cleanup function
    return () => {
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('token_type');
    };
  }, []);

  if (user) {
    router.push("/dashboard");
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!validatePassword(password)) {
        setError(
          "Password must be at least 8 characters long and contain at least one letter and one number."
        );
        return;
      }

      if (!accessToken) {
        toast.error("Access token is missing");
        return;
      }

      if (!refreshToken) {
        toast.error("Refresh token is missing");
        return;
      }

      const response = await axiosInstance.post('/v2/users/update-password', {
        password: password,
        access_token: accessToken,
        refresh_token: refreshToken
      });
      const data = response.data;

      if (data.status === "success") {
        toast.success("Password reset successful");
        router.push("/");
      } else {
        toast.error("Password reset failed");
      }
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className=" p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium ">
              Password
            </label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full pr-10"
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium "
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="w-full pr-10"
              />
              <span
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Page;
