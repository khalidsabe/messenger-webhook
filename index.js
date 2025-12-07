const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Webhook tokens
const WEBHOOK_VERIFY_TOKEN = "Itv@2021";
const PAGE_ACCESS_TOKEN = "EAAQlp2JF0csBQLZBoPTrVAF9ngUDTXXlzj1ZCM4BG0JkW7l90GSy6tX8tv4ZByL0XVSC1W2EJwSXsrglVgwr5cuhYhSfqQHag8nOUc3tTHnmqdzJxlpRr37FS8EKf2BZBAvaMZBKuiZBUhZAI8821pj8KWq5JWOoINYqAVafvsVsZCWZALXNcZBjx5aPHocduqfHE6vuAZD";

const PORT = 3000 //process.env.PORT || 3000;

// Handle incoming Messenger webhooks
app.post("/webhook", async (req, res) => {
  console.log("Incoming Messenger webhook:", JSON.stringify(req.body, null, 2));

  const entry = req.body.entry?.[0];
  const messaging = entry?.messaging?.[0];

  if (!messaging) return res.sendStatus(200);

  const senderId = messaging.sender?.id; // PSID
  const messageText = messaging.message?.text;

  if (!senderId) return res.sendStatus(200);

  if (messageText) {
    try {
      // 1️⃣ FORWARD TO YOUR CHATBOT
      const botResponse = await axios.post(
        "http://crystal-medic-alb-2069411977.us-east-1.elb.amazonaws.com:5000/chat/",
        {
          messageText: messageText,
          senderNumber: senderId
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Chatbot replied:", botResponse.data);

      const replyText = botResponse.data.reply || "I received your message.";

      // 2️⃣ SEND THE CHATBOT RESPONSE BACK TO FACEBOOK USER
      await axios.post(
        `https://graph.facebook.com/v24.0/104072462367834/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        {
          recipient: { id: senderId },
          message: { text: replyText }
        }
      );

      console.log("Replied to user:", replyText);
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);

      // Send fallback message
      await axios.post(
        `https://graph.facebook.com/v24.0/104072462367834/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        {
          recipient: { id: senderId },
          message: { text: "Sorry, something went wrong!" }
        }
      );
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
