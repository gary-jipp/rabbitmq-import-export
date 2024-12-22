const amqp = require('amqplib');

async function main(url, queueName) {
  try {
    // Connect to queue
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    // Get the total number of messages in the queue
    const queueInfo = await channel.assertQueue(queueName, {durable: true});
    const messageCount = queueInfo.messageCount;

    if (messageCount === 0) {
      console.error('Queue is empty. No messages to export.');
      await channel.close();
      await connection.close();
      return;
    }

    console.error(`Exporting ${messageCount} messages from ${queueName}.`);

    const messages = [];
    process.stdout.write("[");

    for (let i = 0; i < messageCount; i++) {
      // Fetch a single message
      const message = await channel.get(queueName, {noAck: false});

      if (message) {
        const content = message.content.toString();
        if (i) {
          process.stdout.write(',\n');
        }

        process.stdout.write(JSON.stringify(JSON.parse(content), null, 2));
        messages.push(JSON.parse(content)); // Assuming messages are JSON

        // Requeue the message
        await channel.sendToQueue(queueName, Buffer.from(content), message.properties);

        // Acknowledge the original message
        await channel.ack(message);
      } else {
        console.error('Warning: Unexpectedly found no message during iteration.');
        break;
      }
    }
    console.log("]");

    // Close the connection
    await channel.close();
    await connection.close();

  } catch (error) {
    console.error('Error while fetching and requeuing messages:', error);
  }
}

const args = process.argv.slice(2);

const queueName = args[0];
if (!queueName) {
  console.error('No queue specified.');
  process.exit();
}

let url = args[1] || 'amqp://localhost';
if (!url.startsWith("amqp://")) {
  url = `amqp://${url}`;
}

main(url, queueName);
