#!/usr/bin/env node

const bookmarks = require("./lib/db/bookmarks");
const amqp = require("amqplib/callback_api");

function showError(err, conn) {
  console.log(err);
  conn.close();
  return process.exit(1);
}

amqp.connect("amqp://localhost", function(err, conn) {
  if (err) return showError(err, conn);

  conn.createChannel(function(err, ch) {
    if (err) return showError(err, conn);

    var q = "bookmarks";
    ch.assertQueue(q, { durable: false }, function (err, ok) {
      if (err) return showError(err, conn);

      // Note: on Node 6 Buffer.from(msg) should be used
      // ch.sendToQueue(q, new Buffer("Hello World!"));
      // console.log(" [x] Sent 'Hello World!'");

      bookmarks.findAll(function(err, result) {
        if (err) return showError(err, conn);

        result.forEach((bookmark) => {
          ch.sendToQueue(q, new Buffer(JSON.stringify(bookmark)));
        });

        conn.close();
        process.exit(0);
      });
    });
  });
});
