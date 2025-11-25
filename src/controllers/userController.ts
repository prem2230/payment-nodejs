import { Request, Response } from "express"
import { User } from "../models/User";
import jwt from "jsonwebtoken";

export class UserController {
    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, name, phone } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
                return;
            }

            const user = new User({
                email,
                password,
                name,
                phone
            });
            await user.save();

            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY || 'secret');

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone
                    },
                    token
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY || 'secret');

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                    },
                    token
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}