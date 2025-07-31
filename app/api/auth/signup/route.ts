import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { hashPassword } from "@/utills/password";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  await UserModel.create(email, hashed);

  return NextResponse.json(
    { message: "User registered successfully" },
    { status: 201 }
  );
}
