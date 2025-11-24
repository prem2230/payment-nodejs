import mongoose, { Schema, Document } from 'mongoose';
import { IPayment, PaymentStatus } from '../types';

interface IPaymentDocument extends IPayment, Document { }

const PaymentSchema = new Schema<IPaymentDocument>({
    userId: { type: String, required: true, ref: 'User' },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    description: { type: String }
}, {
    timestamps: true
});

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
