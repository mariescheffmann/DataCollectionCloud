import mqtt from 'mqtt';
import { writeSensorData, DataPoint } from './influx';
import { readFileSync } from "fs";
import { writeAnalyticsData } from './postgres';

const brokerUrl = process.env.MOSQUITTO_BROKER_FILE ? readFileSync(process.env.MOSQUITTO_BROKER_FILE, "utf8").trim() : undefined;
const topic_1 = process.env.MOSQUITTO_TOPIC_1_FILE ? readFileSync(process.env.MOSQUITTO_TOPIC_1_FILE, "utf8").trim() : undefined;
const topic_2 = process.env.MOSQUITTO_TOPIC_2_FILE ? readFileSync(process.env.MOSQUITTO_TOPIC_2_FILE, "utf8").trim() : undefined;

if (!brokerUrl || !topic_1 || !topic_2) {
  throw new Error(`environment variables not configured:`);
}

export const client = mqtt.connect(brokerUrl);

export function initMqtt() {
  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe([topic_1, topic_2], (err: Error | null) => {
      if (!err) {
        console.log(`Subscribed to topics: ${topic_1}, ${topic_2}`);
      } else {
        console.error('Failed to subscribe to topics:', err);
      }
    });
  });

  client.on('message', async (topic_1: string, message: Buffer) => {
    try {
      const dataPoint: DataPoint = JSON.parse(message.toString());
      if (dataPoint.timestamp && typeof dataPoint.timestamp === "string") {
        dataPoint.timestamp = new Date(dataPoint.timestamp);
      }

      await writeSensorData(dataPoint);
      console.log('Wrote to InfluxDB:', dataPoint);
    } catch (err) {
      console.error('Failed to parse/write MQTT message to NoSQL database:', err);
    }
  });

  client.on('message', async (topic_2: string, message: Buffer) => {
    try {
      const payloadString: string = message.toString();

      await writeAnalyticsData(payloadString);
      console.log('Wrote to PostgreSQL:', payloadString);
    } catch (err) {
      console.error('Failed to parse/write MQTT message to SQL database:', err);
    }
  })
}
