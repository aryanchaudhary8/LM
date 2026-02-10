import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { role } = await req.json();

        if (role !== "student" && role !== "teacher") {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const client = await clerkClient();
        await client.users.updateUser(userId, {
            publicMetadata: {
                userType: role,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json(
            { error: "Failed to update role" },
            { status: 500 }
        );
    }
}