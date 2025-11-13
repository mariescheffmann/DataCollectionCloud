import express, {Request, Response} from 'express';
import { initMqtt, client } from './mqttClient';

const app = express();
const PORT = 5032;

let messages: string[] = [];

initMqtt();

// Saves messages
client.on('message', (topic: string, message: Buffer) => {
  messages.push(message.toString());
  console.log(`Received: ${message.toString()}`);
});

// Shows messages in frontend
app.get('/', (req, res) => {
  const html = `
    <h1>MQTT Messages</h1>
    <ul>
      ${messages.map(msg => `<li>${msg}</li>`).join('')}
    </ul>
  `;
  res.send(html);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
