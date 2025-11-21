import { Consumer, Kafka, Producer } from "kafkajs";

export class KafkaConfig {
    private static instance: KafkaConfig;
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;

    private constructor() {
        this.kafka = new Kafka({
            clientId: 'payment-service',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
        });

        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: 'payment-group' });
    }

    public static getInstance(): KafkaConfig {
        if (!KafkaConfig.instance) {
            KafkaConfig.instance = new KafkaConfig();
        }
        return KafkaConfig.instance;
    }

    public async connectProducer(): Promise<void> {
        await this.producer.connect();
    }

    public async connectConsumer(): Promise<void> {
        await this.consumer.connect();
    }

    public getProducer(): Producer {
        return this.producer;
    }

    public getConsumer(): Consumer {
        return this.consumer;
    }
}