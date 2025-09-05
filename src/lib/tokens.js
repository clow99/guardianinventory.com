import crypto from "crypto";

export function generateToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
}

export function addHours(date, hours) {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
}
