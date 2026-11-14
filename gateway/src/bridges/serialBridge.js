/**
 * Aegis Health — Serial Device Ingress Bridge
 * Compliant with PLAN.md Section 6.4
 * Translates line-delimited JSON telemetry from physical sensor COM port to Gateway
 */

import { WebSocket } from 'ws';

export class SerialDeviceBridge {
  constructor(portPath = 'COM3', baudRate = 115200, gatewayUrl = 'ws://localhost:8787/publish') {
    this.portPath = portPath;
    this.baudRate = baudRate;
    this.gatewayUrl = gatewayUrl;
    this.ws = null;
  }

  start() {
    console.log(`[SerialBridge] Initializing bridge for ${this.portPath} at ${this.baudRate} baud...`);
    this.connectGateway();
  }

  connectGateway() {
    this.ws = new WebSocket(this.gatewayUrl);
    this.ws.on('open', () => {
      console.log(`[SerialBridge] Connected to Gateway ingress at ${this.gatewayUrl}`);
    });
    this.ws.on('error', (err) => {
      console.warn(`[SerialBridge] Gateway connection error: ${err.message}`);
    });
  }

  handleLine(line) {
    if (!line || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      const parsed = JSON.parse(line.trim());
      // Forward valid parsed frame to gateway
      this.ws.send(JSON.stringify(parsed));
    } catch (err) {
      console.warn(`[SerialBridge] Dropped malformed frame: ${line}`);
    }
  }
}

