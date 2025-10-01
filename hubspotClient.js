// server/hubspotClient.js
const { Client } = require("@hubspot/api-client");


function getHubSpotClient(accessToken) {
    return new Client({ accessToken });
}

module.exports = getHubSpotClient;
