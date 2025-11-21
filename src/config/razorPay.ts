import Razorpay from 'razorpay';

export class RazorpayConfig {
    private static instance: RazorpayConfig;
    private razorpay: Razorpay;

    private constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || ''
        });
    }

    public static getInstance(): RazorpayConfig {
        if (!RazorpayConfig.instance) {
            RazorpayConfig.instance = new RazorpayConfig();
        }
        return RazorpayConfig.instance;
    }

    public getRazorpay(): Razorpay {
        return this.razorpay;
    }
}
