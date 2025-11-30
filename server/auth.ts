import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-it";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret-key-change-it";

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateAccessToken(user: { id: string; username: string }) {
    return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(user: { id: string; username: string }) {
    return jwt.sign({ id: user.id, username: user.username }, REFRESH_SECRET, { expiresIn: "7d" });
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.accessToken;

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(401);
        (req as any).user = user;
        next();
    });
}

export function verifyRefreshToken(token: string): any {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (e) {
        return null;
    }
}
