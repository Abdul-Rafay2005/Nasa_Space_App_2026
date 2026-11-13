# Aegis Health: runtime telemetry and visual experience implementation plan

Prepared: 13 November 2026. Repository baseline inspected: `c39fa49`.

This document is the implementation specification, not a claim that the proposed features already exist. All unchecked tasks below are active implementation work.

Navigation: [Current-state audit](#2-current-state-audit) · [Product behavior](#3-product-behavior-and-information-architecture) · [Architecture](#4-target-technical-architecture) · [Data contracts](#5-data-contracts-timing-and-source-integrity) · [Device integration](#6-runtime-acquisition-and-device-integration) · [Heartbeat simulation](#7-heartbeat-simulation-and-live-waveform-specification) · [Persistence and alerts](#8-persistence-aggregation-classification-and-alerts) · [Design system](#9-visual-design-system) · [Screen specifications](#10-page-by-page-redesign-and-chart-specification) · [File structure](#11-proposed-file-structure-and-change-ownership) · [Implementation phases](#12-ordered-implementation-work-packages) · [Verification](#13-verification-and-acceptance-matrix) · [Risks](#14-risk-register-and-concrete-mitigations) · [Demo and delivery](#15-demo-runbook-and-final-delivery).

## 1. Outcome and scope

Transform the existing astronaut health check-in prototype into a runtime monitoring experience. A judge should open the app, immediately recognize that a clearly labeled simulation is running, see a believable moving heartbeat waveform, understand current measurements and trends visually, and explore how the same application can receive actual device readings when compatible hardware is available.

The four required outcomes are:

1. A real acquisition architecture that consumes measurements during runtime, with source adapters, validation, timestamps, connection states, and automatic UI updates. File uploads and manual form submission must not be required to power the monitor.
2. A complete visual redesign: restrained futuristic styling, generous space, clear hierarchy, precise typography, subtle surfaces, and purposeful motion inspired by Apple's design principles without copying an Apple product.
3. A visual-first experience using appropriate charts, a simplified body diagram, meaningful status indicators, and progressive disclosure rather than dense explanatory panels.
4. A hospital-monitor-style moving heartbeat demonstration, generated at runtime from a bundled synthetic waveform sample with bounded, reproducible variation. Numeric heart rate, waveform timing, and any body pulse must agree.

