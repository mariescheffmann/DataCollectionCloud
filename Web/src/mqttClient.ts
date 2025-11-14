import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { writeSensorData, DataPoint } from './influx';

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

  client.on('message', async (topic: string, message: Buffer) => {
  try {
    const dataPoint: DataPoint = JSON.parse(message.toString());
    if (dataPoint.timestamp && typeof dataPoint.timestamp === "string") {
      dataPoint.timestamp = new Date(dataPoint.timestamp);
    }

    await writeSensorData(dataPoint);
    console.log('Wrote to InfluxDB:', dataPoint);
  } catch (err) {
    console.error('Failed to parse/write MQTT message:', err);
  }
  });
}
