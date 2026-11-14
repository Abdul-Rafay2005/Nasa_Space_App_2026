/**
 * Aegis Health — WebSocket Telemetry Ingestion Adapter
 * Compliant with PLAN.md Section 6.3
 */

import { TelemetrySource, TelemetryEventListener } from '../TelemetrySource';
import { SourceDescriptor, SourceState } from '../../../types/telemetry';

export class WebSocketSource implements TelemetrySource {
  private url: string;
  private ws: WebSocket | null = null;
  private state: SourceState = 'idle';
  private listeners: Set<TelemetryEventListener> = new Set();
  private reconnectTimer: number | null = null;
  private retryCount: number = 0;
  private isIntentionallyClosed: boolean = false;
  private descriptor: SourceDescriptor;

  constructor(url: string = 'ws://localhost:8787/telemetry') {
    this.url = url;
    this.descriptor = {
      id: 'websocket-gateway-source',
      label: 'Hardware / Gateway Stream',
      kind: 'device',
      capabilities: {
        waveform: true,
        heartRate: true,
        bloodPressure: true,
        bloodSugar: false,
        bodyTemperature: true,
        sleepDuration: false,
        mood: false,
      },
      deviceMetadata: {
        model: 'Aegis Sensor Gateway v1.0',
      },
    };
  }

  public getDescriptor(): SourceDescriptor {
    return this.descriptor;
  }

  public getState(): SourceState {
    return this.state;
  }

  public async connect(): Promise<void> {
    this.isIntentionallyClosed = false;
    this.initiateConnection();
  }

  public async disconnect(reason: string = 'User disconnected'): Promise<void> {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, reason);
      this.ws = null;
    }
    this.state = 'disconnected';
    this.notify({ type: 'state', state: this.state, error: reason });
  }

  public subscribe(listener: TelemetryEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public dispose(): void {
    this.disconnect('Disposed');
    this.listeners.clear();
  }

  private initiateConnection(): void {
    if (this.state === 'connected' || this.isIntentionallyClosed) return;

    this.state = this.retryCount === 0 ? 'connecting' : 'reconnecting';
    this.notify({ type: 'state', state: this.state });

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.state = 'connected';
        this.retryCount = 0;
        this.notify({ type: 'state', state: this.state });
        this.notify({ type: 'descriptor', descriptor: this.descriptor });

        // Send subscribe handshake
        this.ws?.send(
          JSON.stringify({
            type: 'subscribe',
            protocolVersion: 1,
            astronautId: 'astro-alex-vance',
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'waveform') {
            this.notify({ type: 'waveform', chunk: msg.chunk });
          } else if (msg.type === 'measurement') {
            this.notify({ type: 'measurement', measurement: msg.measurement });
          } else if (msg.type === 'descriptor') {
            this.descriptor = msg.descriptor;
            this.notify({ type: 'descriptor', descriptor: this.descriptor });
          }
        } catch (err) {
          console.warn('Malformed telemetry frame:', err);
        }
      };

      this.ws.onerror = () => {
        this.state = 'error';
        this.notify({ type: 'state', state: 'error', error: 'Connection error' });
      };

      this.ws.onclose = () => {
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed) return;

    this.retryCount++;
    const delay = Math.min(15000, 1000 * Math.pow(2, this.retryCount - 1));
    this.state = 'reconnecting';
    this.notify({ type: 'state', state: 'reconnecting', error: `Reconnecting in ${Math.round(delay / 1000)}s...` });

    this.reconnectTimer = window.setTimeout(() => {
      this.initiateConnection();
    }, delay);
  }

  private notify(event: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in WebSocket listener:', err);
      }
    });
  }
}

