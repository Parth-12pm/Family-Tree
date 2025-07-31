import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { verifyPassword } from "@/utills/password";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return NextResponse.json(null);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(null);
    }

    // Return only necessary user data (don't send password)
    return NextResponse.json({
      id: user._id!.toString(),
      email: user.email,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(null);
  }
}
