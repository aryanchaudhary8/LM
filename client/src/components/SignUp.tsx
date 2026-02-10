"use client";

import { SignUp } from "@clerk/nextjs";
import React from "react";
import { dark } from "@clerk/themes";
import { useSearchParams } from "next/navigation";

const SignUpComponent = () => {
  const searchParams = useSearchParams();
  const isCheckoutPage = searchParams.get("showSignUp") !== null;
  const courseId = searchParams.get("id");

  const signInUrl = isCheckoutPage
      ? `/checkout?step=1&id=${courseId}&showSignUp=false`
      : "/signin";

  // Always redirect to role selection after sign up
  const getRedirectUrl = () => {
    if (isCheckoutPage) {
      return `/select-role?checkout=true&id=${courseId}`;
    }
    return "/select-role";
  };

  return (
      <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "flex justify-center items-center py-5",
              cardBox: "shadow-none",
              card: "bg-customgreys-secondarybg w-full shadow-none",
              footer: {
                background: "#25262F",
                padding: "0rem 2.5rem",
                "& > div > div:nth-child(1)": {
                  background: "#25262F",
                },
              },
              formFieldLabel: "text-white-50 font-normal",
              formButtonPrimary:
                  "bg-primary-700 text-white-100 hover:bg-primary-600 !shadow-none",
              formFieldInput: "bg-customgreys-primarybg text-white-50 !shadow-none",
              footerActionLink: "text-primary-750 hover:text-primary-600",
            },
          }}
          signInUrl={signInUrl}
          forceRedirectUrl={getRedirectUrl()}
          routing="hash"
          afterSignOutUrl="/"
      />
  );
};

export default SignUpComponent;