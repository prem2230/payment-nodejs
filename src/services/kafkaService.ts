import { KafkaConfig } from "../config/kafka";

export class KafkaService {
    private static instance: KafkaService;
    private kafkaConfig = KafkaConfig.getInstance();

    private constructor() { }

    public static getInstance(): KafkaService {
        if (!KafkaService.instance) {
            KafkaService.instance = new KafkaService();
        }
        return KafkaService.instance;
    }

    public async publishMessage(topic: string, message: any): Promise<void> {
        try {
            const producer = this.kafkaConfig.getProducer();
            await producer.send({
                topic,
                messages: [{
                    key: message.userId || message.paymentId,
                    value: JSON.stringify(message),
                    timestamp: Date.now().toString()
                }]
            });
        } catch (error) {
            console.error('Failed to publish message:', error)
        }
    }

    public async subscribeToTopics(topics: string[]): Promise<void> {
        const consumer = this.kafkaConfig.getConsumer();

        for (const topic of topics) {
            await consumer.subscribe({ topic });
        }

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message from ${topic}:`, {
                    partition,
                    offset: message.offset,
                    value: message.value?.toString()
                });

                await this.handleMessage(topic, message.value?.toString());
            }
        });
    }

    private async handleMessage(topic: string, messageValue?: string): Promise<void> {
        if (!messageValue) return;

        try {
            const data = JSON.parse(messageValue);

            switch (topic) {
                case 'payment-created':
                    console.log('Payment created:', data);
                    break;
                case 'payment-updated':
                    console.log('Payment updated:', data);
                    break;
                case 'payment-deleted':
                    console.log('Payment deleted:', data);
                    break;
                default:
                    console.log('Unknown topic:', topic);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
}