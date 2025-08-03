import crypto from "crypto";

export function generateOTP(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += chars[crypto.randomInt(0, chars.length)];
  }
  return otp;
}
