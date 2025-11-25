import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/User";

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'secret') as { id: string };
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
            return;
        }

        (req as any).user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}