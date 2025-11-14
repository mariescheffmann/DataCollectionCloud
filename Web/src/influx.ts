import { InfluxDB, Point } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
dotenv.config({ path: '/DataCollectionCloud/.env' });

dotenv.config();
const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);

export interface DataPoint {
  tag?: string;
  name: string;
  value: number | string | boolean;
  timestamp?: Date;
}

export async function writeSensorData(data: DataPoint) {
  const point = new Point(data.name);

  if (data.tag) {
    point.tag('tag', data.tag);
  }

  if (typeof data.value === 'number') {
    point.floatField(data.name, data.value);
  } else if (typeof data.value === 'string') {
    point.stringField(data.name, data.value);
  } else if (typeof data.value === 'boolean') {
    point.booleanField(data.name, data.value);
  } else {
    console.warn('[Influx] Unsupported value type:', data.value);
    return;
  }

  point.timestamp(data.timestamp || new Date());

  try {
    writeApi.writePoint(point);
    await writeApi.flush();
    console.log(`[Influx] Wrote point: ${point.toString()}`);
  } catch (err) {
    console.error('[Influx Debug] Write/Flush failed:', err);
  }
}

process.on('exit', () => {
  writeApi.close().catch(err => console.error('[Influx Debug] Close failed:', err));
});
