import mqtt from 'mqtt';
import { writeSensorData, DataPoint } from './influx';
import { readFileSync } from "fs";
import { writeAnalyticsData } from './postgres';
import { initializeORM } from './db_service';

const brokerUrl = process.env.MOSQUITTO_BROKER_FILE ? readFileSync(process.env.MOSQUITTO_BROKER_FILE, "utf8").trim() : undefined;
const topic_prefix = process.env.MOSQUITTO_TOPIC_PREFIX_FILE ? readFileSync(process.env.MOSQUITTO_TOPIC_PREFIX_FILE, "utf8").trim() : undefined;
const topic_1 = process.env.MOSQUITTO_TOPIC_1_FILE ? readFileSync(process.env.MOSQUITTO_TOPIC_1_FILE, "utf8").trim() : undefined;
const topic_2 = process.env.MOSQUITTO_TOPIC_2_FILE ? readFileSync(process.env.MOSQUITTO_TOPIC_2_FILE, "utf8").trim() : undefined;

if (!brokerUrl || !topic_1 || !topic_2 || !topic_prefix) {
  throw new Error(`environment variables not configured:`);
}

export const client = mqtt.connect(brokerUrl);

export async function initMqtt() {
  try {
        await initializeORM();
        console.log('[MQTT] Database connection established, ready to process messages.');

    } catch (error) {
        console.error('[MQTT] CRITICAL: Failed to initialize database service (ORM).', error);
        throw error;
    }

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    const influxWildcard1 = `${topic_prefix}${'/'}+${'/'}${topic_1}`;
    const influxWildcard2 = `${topic_prefix}${'/'}+${'/'}${topic_2}`;
    client.subscribe([influxWildcard1, influxWildcard2], (err: Error | null) => {
      if (!err) {
        console.log(`Subscribed to topics: ${influxWildcard1}, ${influxWildcard2}`);
      } else {
        console.error('Failed to subscribe to topics:', err);
      }
    });
  });

  client.on('message', async (topic: string, message: Buffer) => {
    if (topic.startsWith(topic_prefix!) && topic.endsWith(topic_1!)) {
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
    } else if (topic.startsWith(topic_prefix!) && topic.endsWith(topic_2!)) {
      try {
        const payloadString: string = message.toString();
        const payload = JSON.parse(payloadString);
        await writeAnalyticsData(payload);
        console.log('Wrote to PostgreSQL:', payloadString);
      } catch (err) {
        console.error('Failed to parse/write MQTT message to SQL database:', err);
      }
    }
  });
}
