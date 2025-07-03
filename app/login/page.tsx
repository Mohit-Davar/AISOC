"use client";
import { Button } from "@heroui/button";
import Link from "next/link";

const SignInForm = () => {
  return (
    <div className="flex justify-center items-center px-3 h-screen font-inter">
      <div className="z-50 space-y-8 bg-white shadow-md p-8 rounded sm:w-96">
        <h2 className="font-grotesk font-bold text-black text-2xl text-center">
          Welcome Back
        </h2>

        <form className="space-y-6">
          <div>
            <label
              className="block font-medium text-gray-700 text-sm"
              htmlFor="email"
            >
              Email
            </label>
            <input
              autoComplete="email"
              className="bg-gray-100 mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 w-full text-black sm:text-sm"
              id="email"
              placeholder="Email address"
              type="email"
            />
          </div>

          <div>
            <label
              className="block font-medium text-gray-700 text-sm"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              className="bg-gray-100 mt-1 mb-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 w-full text-black sm:text-sm"
              id="password"
              placeholder="Password"
              type="password"
            />
          </div>

          <div className="content-center grid">
            <Button color="success" radius="full" type="submit" variant="ghost">
              Sign In
            </Button>
          </div>
        </form>

        <div className="flex justify-center">
          <span className="text-slate-600 text-sm">
            Don’t have an account?
            <Link
              className="ml-1 font-bold text-black text-sm hover:underline underline-offset-2"
              href="/signup"
            >
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
