import mqtt from 'mqtt';
import dotenv from 'dotenv';
dotenv.config({ path: '/DataCollectionCloud/.env' });

dotenv.config();
const brokerUrl = process.env.BROKER;
const topic = process.env.TOPIC;

export const client = mqtt.connect(brokerUrl);

export function initMqtt() {
  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(topic, (err: Error | null) => {
      if (!err) console.log(`Subscribed to topic ${topic}`);
    });
  });

  client.on('message', (topic: string, message: Buffer) => {
    console.log(`Message on ${topic}: ${message.toString()}`);
  });
}
