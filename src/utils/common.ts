import { LastKnownMetric, MultipleMetrics } from './interfaces/Metrics';

// parses a metric object from an apollo query 
const parseLastKnownMetric = (metric: any) => {
  const parsedMetric: LastKnownMetric = {
    at: metric.at,
    metric: metric.metric,
    unit: metric.unit,
    value: metric.value,
  };
  return parsedMetric;
};

// parses a multiple metric object from an apollo query 
const parseMultipleMetric = (multiMetric: any) => {
  const parsedMultiMetric: MultipleMetrics = {
    metric: multiMetric.metric,
    measurements: multiMetric.measurements.map((measurement: any) => parseLastKnownMetric(measurement)),
  };
  return parsedMultiMetric;
};

// generates a random color
const generateRandomColor = () => {
  let color = '#';
  for (let i = 0; i < 6; i++){
     const random = Math.random();
     const bit = (random * 16) | 0;
     color += (bit).toString(16);
  };
  return color;
};

// checks if a value is unique
const isUnique = (value: any, index: number, self: any) => {
  return self.indexOf(value) === index;
}

export { parseLastKnownMetric, parseMultipleMetric, generateRandomColor, isUnique };
