/**
 * Aegis Health — Runtime Telemetry WebSocket Gateway
 * Compliant with PLAN.md Section 6.3
 */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'UP',
        service: 'Aegis Telemetry Gateway',
        protocolVersion: 1,
        activeSubscribers: subscriberSockets.size,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (req.url === '/sources') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify([
        {
          id: 'websocket-gateway-source',
          label: 'Hardware / Gateway Stream',
          kind: 'device',
          endpoint: `ws://localhost:${PORT}/telemetry`,
          capabilities: {
            waveform: true,
            heartRate: true,
            bloodPressure: true,
            bodyTemperature: true,
          },
        },
      ])
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const wssTelemetry = new WebSocketServer({ noServer: true });
const wssPublish = new WebSocketServer({ noServer: true });

const subscriberSockets = new Set();
const publisherSockets = new Set();

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === '/telemetry') {
    wssTelemetry.handleUpgrade(request, socket, head, (ws) => {
      wssTelemetry.emit('connection', ws, request);
    });
  } else if (pathname === '/publish') {
    wssPublish.handleUpgrade(request, socket, head, (ws) => {
      wssPublish.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Telemetry Subscribers (Browsers)
wssTelemetry.on('connection', (ws) => {
  subscriberSockets.add(ws);
  console.log(`[Gateway] New subscriber client connected (${subscriberSockets.size} total)`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe') {
        ws.send(
          JSON.stringify({
            type: 'descriptor',
            descriptor: {
              id: 'gateway-active-stream',
              label: 'Gateway Telemetry Link',
              kind: 'device',
              capabilities: { waveform: true, heartRate: true, bloodPressure: true, bodyTemperature: true },
            },
          })
        );
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    subscriberSockets.delete(ws);
    console.log(`[Gateway] Subscriber disconnected (${subscriberSockets.size} total)`);
  });
});

// Publishers (Hardware Bridge / Test Ingress)
wssPublish.on('connection', (ws) => {
  publisherSockets.add(ws);
  console.log(`[Gateway] Publisher connected. Fanout active.`);

  ws.on('message', (message) => {
    // Broadcast incoming measurement / waveform to all subscribed browser clients
    const payload = message.toString();
    for (const sub of subscriberSockets) {
      if (sub.readyState === WebSocket.OPEN) {
        sub.send(payload);
      }
    }
  });

  ws.on('close', () => {
    publisherSockets.delete(ws);
    console.log(`[Gateway] Publisher disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Aegis Telemetry Gateway running on http://localhost:${PORT}`);
  console.log(`  - Telemetry Stream:  ws://localhost:${PORT}/telemetry`);
  console.log(`  - Ingress Publisher: ws://localhost:${PORT}/publish`);
  console.log(`  - Health Check:      http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

