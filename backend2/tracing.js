// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');


const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'todo-api-service',
});

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    // Jaeger / Tempo OTLP endpoint
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log('✅ OpenTelemetry initialized');

process.on('SIGTERM', async () => {
  await sdk.shutdown();
  process.exit(0);
});
