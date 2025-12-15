// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// 1. 引入 OTLP Metric Exporter
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');

// 2. 依然需要引入 PeriodicExportingMetricReader
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'todo-api-service',
});

// Trace 設定 (維持不變)
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

// 3. 設定 Metric Exporter
const metricExporter = new OTLPMetricExporter({
  // 注意：這裡的路徑通常是 /v1/metrics
  url: 'http://localhost:4318/v1/metrics', 
});

// 4. 設定 Metric Reader (將 Exporter 放進去)
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter, // 這裡放入 OTLP Exporter
  exportIntervalMillis: 5000, // 設定 5 秒送一次 (生產環境通常設 60000)
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader, // 使用 reader
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log('✅ OpenTelemetry initialized with OTLP Metrics');

process.on('SIGTERM', async () => {
  await sdk.shutdown();
  process.exit(0);
});