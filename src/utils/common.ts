import { LastKnownMetric, MultipleMetrics } from './interfaces/Metrics';

const parseLastKnownMetric = (metric: any) => {
  const parsedMetric: LastKnownMetric = {
    at: metric.at,
    metric: metric.metric,
    unit: metric.unit,
    value: metric.value,
  };
  return parsedMetric;
};

const parseMultipleMetric = (multiMetric: any) => {
  const parsedMultiMetric: MultipleMetrics = {
    metric: multiMetric.metric,
    measurements: multiMetric.measurements.map((measurement: any) => parseLastKnownMetric(measurement)),
  };
  return parsedMultiMetric;
};

export { parseLastKnownMetric, parseMultipleMetric };
