import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const { title } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await db.course.create({
            data: {
                userId,
                title,
            }
        });

        return NextResponse.json(course, { status: 200 });

    } catch (error) {

        console.log("[COURSES]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}