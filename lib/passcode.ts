"use server"

import { cookies } from "next/headers"
import type { PasscodeState } from "./types"

// Generate a random 6-digit passcode
export function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store the current passcode in memory (for the passcode generator)
let currentPasscodeState: PasscodeState | null = null

// Set the current passcode (for the passcode generator)
export function setCurrentPasscode(code: string, expiresAt: number) {
  currentPasscodeState = { code, expiresAt }
  return { success: true }
}

// Get the current passcode (for the passcode generator)
export function getCurrentPasscode(): PasscodeState | null {
  return currentPasscodeState
}

// Store the current passcode in a cookie that both sites can access
export async function storePasscode(passcode: string, expiresAt: number) {
  const passcodeState: PasscodeState = {
    code: passcode,
    expiresAt,
  }

  cookies().set("currentPasscode", JSON.stringify(passcodeState), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return { success: true }
}

// Validate a passcode
export async function validatePasscode(passcode: string): Promise<boolean> {
  try {
    const generatorUrl = "https://v0-new-project-uuhmjf0thl7.vercel.app/" || "http://localhost:3001";
    
    // Fetch the current passcode from the generator site
    const response = await fetch(`${generatorUrl}/api/current-passcode`, {
      cache: "no-store",
    });


    if (!response.ok) {
      return false
    }

    const data = await response.json()

    // Check if the passcode is valid and not expired
    if (!data.passcode || data.expiresAt < Date.now()) {
      return false
    }

    return data.passcode === passcode
  } catch (error) {
    console.error("Error validating passcode:", error)
    return false
  }
}
