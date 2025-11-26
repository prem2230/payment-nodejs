import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { DatabaseConfig } from './config/database';
import { KafkaConfig } from './config/kafka';
import { KafkaService } from './services/kafkaService';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/user';

dotenv.config();

class App {
    public app: express.Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || '3000');

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeDatabase();
        this.initializeKafka();
    }

    private initializeMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static('public'));

    }

    private initializeRoutes(): void {
        this.app.use('/api/payments', paymentRoutes);
        this.app.use('/api/users', userRoutes);

        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() })
        });
    }

    private async initializeDatabase(): Promise<void> {
        const database = DatabaseConfig.getInstance();
        await database.connect();
    }

    private async initializeKafka(): Promise<void> {
        const kafkaConfig = KafkaConfig.getInstance();
        await kafkaConfig.connectProducer();
        await kafkaConfig.connectConsumer();

        const kafkaService = KafkaService.getInstance();
        await kafkaService.subscribeToTopics(['payment-created', 'payment-completed']);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}

const app = new App();
app.listen();

export default app;