export default interface MetricsInterface {
  metricTypes: string[];
  selectedMetrics: string[];
  metricsData: MultipleMetrics[];
  metricsLastKnown: LastKnownMetric[];
}

export interface MultipleMetrics {
  measurements: LastKnownMetric[];
  metric: string;
}

export interface LastKnownMetric {
  at: number;
  metric: string;
  unit: string;
  value: number;
}
