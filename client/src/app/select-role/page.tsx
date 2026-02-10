"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SelectRole() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const courseId = searchParams.get("id");
    const isCheckout = searchParams.get("checkout") === "true";

    const handleRoleSelection = async (role: "student" | "teacher") => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await fetch("/api/user/set-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                throw new Error("Failed to set role");
            }

            // Wait for Clerk to sync
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reload user
            await user.reload();

            // Determine redirect URL
            const redirectUrl = (isCheckout && courseId)
                ? `/checkout?step=2&id=${courseId}`
                : role === "teacher"
                    ? "/teacher/courses"
                    : "/user/courses";

            // Hard refresh to get fresh session token
            window.location.assign(redirectUrl);

        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to set role. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-customgreys-secondarybg">
            <div className="text-center space-y-8 p-8">
                <div>
                    <h1 className="text-3xl font-bold text-white-100 mb-2">
                        Welcome! Choose Your Role
                    </h1>
                    <p className="text-white-50">
                        Select how you'll be using the platform
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <button
                        onClick={() => handleRoleSelection("student")}
                        disabled={loading}
                        className="group relative px-8 py-12 bg-customgreys-primarybg rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-primary-600"
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">🎓</div>
                            <h2 className="text-xl font-semibold text-white-100 mb-2">
                                Student
                            </h2>
                            <p className="text-white-50 text-sm">
                                Learn from courses and track your progress
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelection("teacher")}
                        disabled={loading}
                        className="group relative px-8 py-12 bg-customgreys-primarybg rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-primary-600"
                    >
                        <div className="text-center">
                            <div className="text-5xl mb-4">👨‍🏫</div>
                            <h2 className="text-xl font-semibold text-white-100 mb-2">
                                Teacher
                            </h2>
                            <p className="text-white-50 text-sm">
                                Create and manage courses for students
                            </p>
                        </div>
                    </button>
                </div>

                {loading && (
                    <p className="text-white-50 text-sm">Setting up your account...</p>
                )}
            </div>
        </div>
    );
}