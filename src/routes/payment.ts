import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";
import { authenticate } from "../middleware/auth";

const router = Router();
const paymentController = new PaymentController();

router.use(authenticate);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/', paymentController.getPayments);

export default router;