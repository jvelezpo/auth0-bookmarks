#!/usr/bin/env node

const bookmarks = require("./lib/db/bookmarks");
const amqp = require("amqplib");

async function publish() {
  try {
    const conn = await amqp.connect("amqp://localhost");
    const ch = await conn.createChannel();
    const q = "bookmarks";
    const interval = 1000;

    await ch.assertQueue(q, { durable: false });

    console.log(" [*] Queuing bookmarks in %s every %sms. To exit press CTRL+C", q, interval);

    let queueBookmarks = () => {
      bookmarks.findAll((err, bookmarks) => {
        console.log(" [*] Queuing %s bookmarks", bookmarks.length);
        if (err) return showError(err, conn);

        bookmarks.forEach((bookmark) => {
          ch.sendToQueue(q, Buffer.from(JSON.stringify(bookmark)));
        });
      });
    };

    setInterval(queueBookmarks, interval);
  } catch (e) {
    console.log(e);
    conn.close();
  }
}

publish();