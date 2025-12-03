const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Webhook tokens
const WEBHOOK_VERIFY_TOKEN = "Itv@2021";
const PAGE_ACCESS_TOKEN = "PASTE_YOUR_PAGE_ACCESS_TOKEN_HERE";

const PORT = process.env.PORT || 3000;

// Handle incoming Messenger webhooks
app.post("/webhook", async (req, res) => {
  console.log("Incoming Messenger webhook:", JSON.stringify(req.body, null, 2));

  const entry = req.body.entry?.[0];
  const messaging = entry?.messaging?.[0];

  if (!messaging) {
    return res.sendStatus(200);
  }

  const senderId = messaging.sender?.id; // PSID
  const messageText = messaging.message?.text;

  if (messageText) {
    // Reply back to the user
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v24.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      data: {
        recipient: { id: senderId },
        message: { text: "Echo: " + messageText }
      }
    });

    // Forward to your chatbot
    try {
      await axios({
        method: "POST",
        url: "http://crystal-medic-alb-2069411977.us-east-1.elb.amazonaws.com:5000/chat/",
        headers: { "Content-Type": "application/json" },
        data: {
          messageText: messageText,
          senderNumber: senderId,
          messageId: messaging.message.mid
        }
      });

      console.log("Message forwarded to chatbot!");
    } catch (err) {
      console.error("Chatbot forwarding failed:", err);
    }
  }

  res.sendStatus(200);
});

// Webhook verification (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("Messenger webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Facebook Messenger Webhook Running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
