// server.js
const express = require('express');
const getHubSpotClient = require('./hubspotClient');
const app = express();
const PORT = 3000;

const HUBSPOT_CLIENT_ID = "341205a8-439a-4930-8c42-d25ff3094e11";
const HUBSPOT_CLIENT_SECRET = "c5d4fe4d-be59-4d7d-b0d5-2ce553696dec";
const HUBSPOT_REDIRECT_URI = "https://hubspot-test-theta.vercel.app/hubspot/callback";
const accessToken = "CKXVx_mZMxIQQlNQMl8kQEwrAgMACAkWEhipzax0IK2mtEwo5uOBCjIUp1NSlik9ywASO7ONmrXLBXVPo1w6F0JTUDJfJEBMKwIKAAgZBnFOMAEBAWQFQhQ5O8IG-HZiu4jrdIEXouXSOImCL0oDbmEyUgBaAGAAaMGQtExwAXgB"
// Middleware to parse JSON
app.use(express.json());


// Simple route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// =======================
// OAuth Connect Route
// =======================
app.get("/connect", (req, res) => {
    const scopes = [
        "crm.objects.contacts.read",
        "crm.objects.contacts.write",
        // REMOVE "webhooks" scope — not valid
    ];

    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}` +
        `&scope=${scopes.join("%20")}` +
        `&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}`;

    return res.send(authUrl);
});

// =======================
// OAuth Callback Route
// =======================
app.get("/hubspot/callback", async (req, res) => {
    const { code } = req.query;
    try {
        const tokenResp = await fetch("https://api.hubapi.com/oauth/v1/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: HUBSPOT_CLIENT_ID,
                client_secret: HUBSPOT_CLIENT_SECRET,
                redirect_uri: HUBSPOT_REDIRECT_URI,
                code
            })
        });

        const tokenJson = await tokenResp.json();
        console.log("Token JSON:", tokenJson);

        // TODO: Save tokenJson in MongoDB linked to your user
        // await User.findByIdAndUpdate(req.user._id, { hubspotToken: tokenJson });

        res.redirect("https://app.dev.inagent.ai/settings")
    } catch (err) {
        console.error(err);
        res.status(500).send("OAuth callback failed");
    }
});

// =======================
// Webhook Route
// =======================
app.post("/hubspot/webhook", (req, res) => {
    console.log("Received HubSpot webhook:", req.body);

    // TODO: Handle events, e.g., contact creation, property changes
    // Example: update MongoDB lead based on objectId
    // const { objectId, subscriptionType, propertyName } = req.body;

    res.sendStatus(200); // MUST respond 200 to HubSpot
});



app.get("/me", async (req, res) => {
    try {
        const hubspotClient = getHubSpotClient("CKXVx_mZMxIQQlNQMl8kQEwrAgMACAkWEhipzax0IK2mtEwo5uOBCjIUp1NSlik9ywASO7ONmrXLBXVPo1w6F0JTUDJfJEBMKwIKAAgZBnFOMAEBAWQFQhQ5O8IG-HZiu4jrdIEXouXSOImCL0oDbmEyUgBaAGAAaMGQtExwAXgB");
        const me = await hubspotClient.oauth.accessTokensApi.get("CKXVx_mZMxIQQlNQMl8kQEwrAgMACAkWEhipzax0IK2mtEwo5uOBCjIUp1NSlik9ywASO7ONmrXLBXVPo1w6F0JTUDJfJEBMKwIKAAgZBnFOMAEBAWQFQhQ5O8IG-HZiu4jrdIEXouXSOImCL0oDbmEyUgBaAGAAaMGQtExwAXgB")
        console.log(me)
        res.json(me);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch HubSpot info");
    }
});


app.post("/contacts", async (req, res) => {
    try {
        // const user = await User.findById(req.params.userId);
        const hubspotClient = getHubSpotClient(accessToken);

        const contact = await hubspotClient.crm.contacts.basicApi.create({
            properties: {
                email: "test@gmail.com",
                firstname: "Test",
                lastname: "Tester",
            }
        });

        res.json(contact);
    } catch (err) {
        console.error(err.response?.body || err);
        res.status(500).send("Failed to create contact");
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
