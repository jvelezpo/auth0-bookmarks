#!/usr/bin/env node

const amqp = require('amqplib');

async function work() {
  try {
    const conn = await amqp.connect('amqp://localhost');
    const ch = await conn.createChannel();
    const q = "bookmarks";

    ch.assertQueue(q, { durable: false});

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(bookmark) {
      console.log(" [x] Received %s", bookmark.content.toString());
    }, {noAck: true});
  } catch (e) {
    console.log(e);
  }
}

work();
console.log("started working");