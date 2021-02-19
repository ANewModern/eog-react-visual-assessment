export default interface MetricsInterface {
  metricTypes: string[];
  selectedMetrics: string[];
  metricsData: object[];
  metricsLastKnown: LastKnownMetric[];
}
export interface LastKnownMetric {
  at: number;
  metric: string;
  unit: string;
  value: number;
}
