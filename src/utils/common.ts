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

const generateRandomColor = () => {
  let color = '#';
  for (let i = 0; i < 6; i++){
     const random = Math.random();
     const bit = (random * 16) | 0;
     color += (bit).toString(16);
  };
  return color;
};

const isUnique = (value: any, index: number, self: any) => {
  return self.indexOf(value) === index;
}

export { parseLastKnownMetric, parseMultipleMetric, generateRandomColor, isUnique };
