import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'todo-app-service',

});

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});
const provider = new WebTracerProvider({
  resource,
  spanProcessors: [
    new SimpleSpanProcessor(traceExporter),
  ],
});
provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new W3CTraceContextPropagator(),
});

registerInstrumentations({
  instrumentations: [
    getWebAutoInstrumentations({
      // 🔥 只追蹤 fetch 請求到 localhost:3000
      '@opentelemetry/instrumentation-fetch': {
        propagateTraceHeaderCorsUrls: [
          /localhost:8080/,  // 只追蹤你的後端 API
        ],
        clearTimingResources: true,
        // 🔥 過濾掉不想追蹤的請求
        ignoreUrls: [
          /localhost:4318/,  // 忽略發送到 collector 的請求
          /\.hot-update\./,  // 忽略 HMR
          /sockjs-node/,     // 忽略 webpack dev server
          /webpack/,         // 忽略 webpack
        ],
      },
      // 🔥 關閉 XMLHttpRequest 追蹤（如果你只用 fetch）
      '@opentelemetry/instrumentation-xml-http-request': {
        enabled: false,
      },
      // 🔥 關閉頁面載入追蹤
      '@opentelemetry/instrumentation-document-load': {
        enabled: false,
      },
      // 🔥 關閉使用者互動追蹤
      '@opentelemetry/instrumentation-user-interaction': {
        enabled: false,
      },
    }),
  ],
});