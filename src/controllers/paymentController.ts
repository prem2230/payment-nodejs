import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { Payment } from "../models/payment";
import { create } from "domain";

export class PaymentController {
    private paymentService = new PaymentService();

    public createOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { amount, currency } = req.body;
            const userId = (req as any).user._id;

            const result = await this.paymentService.createOrder(userId, amount, currency);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    public verifyPayment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            const isValid = await this.paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

            res.json({
                success: true,
                verified: isValid
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    public getPayments = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const payments = await Payment.find({ userId: userId }).sort({ createdAt: -1 });

            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }
}