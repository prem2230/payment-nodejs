import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction, TransactionType, TransactionStatus } from '../types';

interface ITransactionDocument extends ITransaction, Document { }

const TransactionSchema = new Schema<ITransactionDocument>({
    paymentId: { type: String, required: true, ref: 'Payment' },
    userId: { type: String, required: true, ref: 'User' },
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(TransactionStatus),
        required: true
    },
    metadata: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
