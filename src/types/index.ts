export interface IUser {
    _id?: string;
    email: string;
    password: string;
    name: string;
    phone?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPayment {
    _id?: string;
    userId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITransaction {
    _id?: string;
    paymentId: string;
    userId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    metadata?: Record<string, any>;
    createdAt?: Date;
}

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export enum TransactionType {
    PAYMENT = 'payment',
    REFUND = 'refund',
    SETTLEMENT = 'settlement'
}

export enum TransactionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    PROCESSING = 'processing'
}

export interface KafkaMessage {
    topic: string;
    partition: number;
    message: {
        key?: string;
        value: string;
        timestamp: string;
    };
}
