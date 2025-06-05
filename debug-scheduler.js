#!/usr/bin/env node

/**
 * Debug script for testing the Git Report scheduler
 *
 * Usage:
 *   node debug-scheduler.js [API_URL]
 *
 * Default API_URL: http://localhost:3001
 */

const https = require("https");
const http = require("http");

const API_URL = process.argv[2] || "http://localhost:3003";

async function makeRequest(url, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.headers["Content-Length"] = Buffer.byteLength(
        JSON.stringify(data),
      );
    }

    const req = client.request(url, options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function checkHealth() {
  console.log("🏥 Checking health status...");
  try {
    const response = await makeRequest(`${API_URL}/health`);
    console.log("Status:", response.status);
    console.log("Health:", JSON.stringify(response.body, null, 2));
    return response.body;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return null;
  }
}

async function triggerScheduler() {
  console.log("🚀 Manually triggering scheduler...");
  try {
    const response = await makeRequest(
      `${API_URL}/health/trigger-scheduler`,
      "POST",
    );
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.body, null, 2));
    return response.body;
  } catch (error) {
    console.error("❌ Failed to trigger scheduler:", error.message);
    return null;
  }
}

async function main() {
  console.log(`🔍 Debugging scheduler at ${API_URL}`);
  console.log("=".repeat(50));

  // Check health first
  const health = await checkHealth();

  if (!health) {
    console.log("❌ Cannot connect to API. Make sure your server is running.");
    return;
  }

  console.log("\n" + "=".repeat(50));

  // Trigger scheduler manually
  const triggerResult = await triggerScheduler();

  console.log("\n" + "=".repeat(50));

  // Check health again to see updated stats
  console.log("🔄 Checking health after trigger...");
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
  await checkHealth();

  console.log("\n✅ Debug complete!");
  console.log("\n💡 Tips:");
  console.log("- Check the server logs for detailed scheduling information");
  console.log("- Make sure you have enabled report configurations");
  console.log("- Verify your cron expressions are valid");
  console.log(
    "- Check your database has report_configurations with enabled=true",
  );
}

if (require.main === module) {
  main().catch(console.error);
}
