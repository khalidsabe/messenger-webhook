# Facebook Messenger Webhook (Node.js)

This project is a fully working **Facebook Messenger Webhook Server** written in Node.js.  
It receives messages from your Facebook Page, replies automatically, and forwards the message to your chatbot API.

This project works on **free hosting platforms** such as Render, Railway, Replit, or Glitch (no credit card required).

---

## Features

- Facebook Messenger webhook verification
- Receive messages from your Page (PSID)
- Reply automatically using Page Access Token
- Forward message to external chatbot API
- Node.js + Express + Axios
- Supports `.env` environment variables

---

## Requirements

You need:

1. A Facebook Page  
2. A Meta Developer App connected to the Page  
3. Webhooks enabled  
4. Page subscription to Messenger events  
5. A public webhook URL (Render / Railway / Replit)

---

## Environment Variables

Create a `.env` file in the root directory:
