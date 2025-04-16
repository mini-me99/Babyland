import { NextResponse } from "next/server"

// Access the shared passcode state
// This is a simplified approach - in production, you'd use a database or Redis
let currentPasscode: { code: string; expiresAt: number } | null = null

// This is defined in the store-passcode route, but we're redefining it here
// to ensure it's accessible in this module
if (typeof global.currentPasscode !== "undefined") {
  currentPasscode = global.currentPasscode
} else {
  global.currentPasscode = currentPasscode
}

export async function GET() {
  try {
    if (!currentPasscode) {
      return NextResponse.json({ success: false, error: "No passcode available" }, { status: 404 })
    }

    // Check if the passcode has expired
    if (currentPasscode.expiresAt < Date.now()) {
      return NextResponse.json({ success: false, error: "Passcode expired" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      passcode: currentPasscode.code,
      expiresAt: currentPasscode.expiresAt,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "An error occurred" }, { status: 500 })
  }
}
