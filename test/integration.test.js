const { DockerComposeEnvironment, Wait } = require("testcontainers");
const mqtt = require("mqtt");
const { Client } = require("pg");
const { InfluxDB } = require("@influxdata/influxdb-client");
const fs = require("fs");
const path = require("path");

jest.setTimeout(300000);

describe("Cloud Integration Tests", () => {
  let environment;
  let mqttClient;

  const getSecret = (name) => fs.readFileSync(path.join(__dirname, `../secrets/${name}.txt`), "utf8").trim();

  const TOPIC_PREFIX = getSecret("mosquitto/mosquitto_topic_prefix");
  const TOPIC_INFLUX_SUFFIX = getSecret("mosquitto/mosquitto_topic_1");
  const TOPIC_POSTGRES_SUFFIX = getSecret("mosquitto/mosquitto_topic_2");
  const INFLUX_ORG = getSecret("influx/influx_org");
  const INFLUX_BUCKET = getSecret("influx/influx_bucket");

  const CONTAINERS = {
    postgres: "postgres",
    influx: "influxdb",
    mqtt: "mosquitto"
  };

  beforeAll(async () => {
    environment = await new DockerComposeEnvironment(path.join(__dirname, ".."), "docker-compose.yml")
      .withWaitStrategy(CONTAINERS.postgres, Wait.forListeningPorts())
      .withWaitStrategy(CONTAINERS.mqtt, Wait.forListeningPorts())
      .withWaitStrategy(CONTAINERS.influx, Wait.forListeningPorts())
      .up();

    const mqttPort = environment.getContainer(CONTAINERS.mqtt).getMappedPort(1883);

    await new Promise(r => setTimeout(r, 10000));

    mqttClient = mqtt.connect(`mqtt://localhost:${mqttPort}`, { connectTimeout: 5000 });

    await new Promise((resolve, reject) => {
      mqttClient.on("connect", resolve);
      mqttClient.on("error", reject);
    });
  }, 300000);

  afterAll(async () => {
    if (mqttClient) mqttClient.end();
    if (environment) await environment.down();
  });

  test("Postgres Integration: Should insert machine state change", async () => {
    const pgPort = environment.getContainer(CONTAINERS.postgres).getMappedPort(5432);
    const topic = `${TOPIC_PREFIX}/test-machine/${TOPIC_POSTGRES_SUFFIX}`;

    const payload = {
      machine_id: 1,
      event_name: "MachineStateChange",
      opcua_value: 9,
      stateValue: 9,
      opcua_source_id: 1,
      template_config: {
        action: "INSERT",
        target_table: "machine_state_relation",
        mapping: [
          { source: "stateValue", target_column: "state_id", lookup_table: "states" },
          { source: "opcua_source_id", target_column: "machine_id" },
          { source: "timestamp", target_column: "start_time" }
        ]
      },
      timestamp: new Date().toISOString()
    };

    mqttClient.publish(topic, JSON.stringify(payload));
    await new Promise(r => setTimeout(r, 8000));

    const pgClient = new Client({
      host: "localhost",
      port: pgPort,
      user: getSecret("postgres/postgres_user"),
      password: getSecret("postgres/postgres_password"),
      database: getSecret("postgres/postgres_db"),
    });

    await pgClient.connect();
    const res = await pgClient.query(`SELECT * FROM ${payload.template_config.target_table} ORDER BY start_time DESC LIMIT 1`);
    expect(res.rowCount).toBeGreaterThan(0);
    const row = res.rows[0];
    expect(Number(row.machine_id)).toBe(payload.machine_id);
    expect(Number(row.state_id)).toBe(payload.stateValue);

    await pgClient.end();
  });

  test("InfluxDB Integration: Should store timeseries data", async () => {
    const influxPort = environment.getContainer(CONTAINERS.influx).getMappedPort(8086);
    const topic = `${TOPIC_PREFIX}/test-machine/${TOPIC_INFLUX_SUFFIX}`;
    const measurement = "totalCounter";
    const testValue = 42;

    const payload = {
      name: measurement,
      value: testValue,
      timestamp: new Date().toISOString()
    };

    mqttClient.publish(topic, JSON.stringify(payload));
    await new Promise(r => setTimeout(r, 8000));

    const influxDB = new InfluxDB({
        url: `http://localhost:${influxPort}`,
        token: getSecret("influx/influx_token")
    });

    const queryApi = influxDB.getQueryApi(INFLUX_ORG);
    const query = `
      from(bucket: "${INFLUX_BUCKET}")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "${measurement}")
    `;

    const result = await queryApi.collectRows(query);
    expect(result.length).toBeGreaterThan(0);
    const record = result[result.length - 1];
    expect(record._value).toBe(testValue);
    expect(record._field).toBe(measurement);
  });
});
