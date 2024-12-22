const amqp = require('amqplib');
const fs = require('fs');

async function importMessages(url, queueName, fileName) {
  let count = 0;

  try {
    // Read the JSON array from the input file
    const data = fs.readFileSync(fileName, 'utf8');
    const messages = JSON.parse(data);

    // Connect to RabbitMQ
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    // Assert the queue (create it if it doesn't exist)
    await channel.assertQueue(queueName, {durable: true});

    // Import messages back to the queue
    for (const message of messages) {
      // Convert the message back to a Buffer
      const messageContent = JSON.stringify(message);

      // Send the message back to the queue
      channel.sendToQueue(queueName, Buffer.from(messageContent));
      count++;
    }

    // Close the connection and channel
    await channel.close();
    await connection.close();

    console.log(`${count} messages queued to ${queueName}`);
  } catch (error) {
    console.error('Error while importing messages:', error);
  }
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: import <filename> <queue> [<url>]");
  process.exit();
}

const filename = args[0];
if (!filename) {
  console.error('No filename specified.');
  process.exit();
}

const queue = args[1];
if (!queue) {
  console.error('No queue specified.');
  process.exit();
}

let url = args[3] || 'amqp://localhost';
if (!url.startsWith("amqp://")) {
  url = `amqp://${url}`;
}

importMessages(url, queue, filename);
