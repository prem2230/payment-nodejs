import { RazorpayConfig } from "../config/razorPay";
import { Payment } from "../models/Payment";
import { Transaction } from "../models/Transaction";
import { PaymentStatus, TransactionStatus, TransactionType } from "../types";
import { KafkaService } from "./kafkaService";
import crypto from 'crypto';

export class PaymentService {
    private razorpay = RazorpayConfig.getInstance().getRazorpay();
    private kafkaService = KafkaService.getInstance();

    public async createOrder(userId: string, amount: number, currency: string = 'INR'): Promise<any> {
        try {
            // Create Razorpay order
            const order = await this.razorpay.orders.create({
                amount: amount * 100, // Convert to paise
                currency,
                receipt: `receipt_${Date.now()}`,
            });

            // Save Payment Record 
            const payment = new Payment({
                userId,
                amount,
                currency,
                status: PaymentStatus.PENDING,
                razorpayOrderId: order.id
            });

            await payment.save();

            // Publish to Kafka
            await this.kafkaService.publishMessage('payment-created', {
                paymentId: payment._id,
                userId,
                amount,
                orderId: order.id
            });

            return { order, paymentId: payment._id }
        } catch (error) {
            throw new Error(`Failed to create order: ${error}`);
        }
    }

    public async verifyPayment(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ): Promise<boolean> {
        try {
            const body = razorpayOrderId + '|' + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_SECRET || '')
                .update(body.toString())
                .digest('hex');

            const isAuthentic = expectedSignature === razorpaySignature;

            if (isAuthentic) {
                await this.updatePaymentStatus(razorpayOrderId, razorpayPaymentId, razorpaySignature)
            }

            return isAuthentic;
        } catch (error) {
            throw new Error(`Payment verificatio failed: ${error}`)
        }
    }

    private async updatePaymentStatus(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ): Promise<void> {
        const payment = await Payment.findOne({ razorpayOrderId });

        if (payment) {
            payment.status = PaymentStatus.COMPLETED;
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.razorpaySignature = razorpaySignature;
            await payment.save();

            // Create transaction record
            const transaction = new Transaction({
                paymentId: payment._id,
                userId: payment.userId,
                type: TransactionType.PAYMENT,
                amount: payment.amount,
                status: TransactionStatus.SUCCESS
            });

            await transaction.save();

            // Publish success event
            await this.kafkaService.publishMessage('payment-completed', {
                paymentId: payment._id,
                userId: payment.userId,
                amount: payment.amount
            });
        }
    }
}