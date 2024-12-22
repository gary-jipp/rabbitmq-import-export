# MQ Import & Export.


Exports & imports messages from any amqp compatible MQ server including RabbitMQ.


## Export
Exports queue messages to stdout.  Defaults to localhost url.
```bash
node export.js <queue> [<server url>]
```

## Import
Imports queue messages from a file.  Defaults to localhost url
```bash
node import.js <filaname> <queue> [<server url>]
```

Server url can also contain credentials: `username:password@hostname`.