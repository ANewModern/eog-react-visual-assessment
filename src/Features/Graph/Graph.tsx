import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';
import { actions } from '../Graph/reducer';
import { LastKnownMetric, MultipleMetrics } from '../../utils/interfaces/Metrics';
import { isUnique, parseMultipleMetric } from '../../utils/common';
import StateInterface from '../../utils/interfaces/State';

interface PropTypes {
  items: LastKnownMetric[];
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  },
});

const generateQueryMultiples = (metrics: LastKnownMetric[]) => {
  const measurementsTemplate = `
    measurement: getMultipleMeasurements(input: {
      metricName: "measurement",
      after: halfHourBeforeTime,
      before: currentTime,
    }) {
        metric,
        measurements {
          metric,
          at,
          value,
          unit,
        }
    }
  `;

  return `
    query Measurements {
      ${metrics.map(metric => {
        const query = measurementsTemplate
          .replace('measurement', metric.metric)
          .replace('"measurement"', `"${metric.metric}"`)
          .replace('currentTime', new Date(metric.at).getTime().toString())
          .replace('halfHourBeforeTime', new Date(metric.at + -30 * 60000).getTime().toString());
        return query;
      })}
    }
  `;
};

const createAxis = (metrics: MultipleMetrics[], colors: string[]) => {
  const types: string[] = metrics.map(metric => metric.measurements[0].unit).filter(isUnique);
  const axis: any = {};

  types.map((type, idx) => {
    axis[`yaxis${idx + 1}`] = {
      title: type,
      anchor: 'free',
      overlaying: 'y',
      side: 'left',
      position: 0.15 * idx,
    };
    return type;
  });

  return axis;
};

export default (props: PropTypes) => {
  const dispatch = useDispatch();
  const { items } = props;
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphHeight, setGraphHeight] = useState<number>(0);
  const [graphWidth, setGraphWidth] = useState<number>(0);
  const { metricsData, graphColors } = useSelector((state: StateInterface) => ({
    metricsData: state.metrics.metricsData,
    graphColors: state.metrics.graphColors,
  }));
  const { loading, error, data } = useQuery(
    gql`
      ${generateQueryMultiples(items)}
    `,
  );

  // If loading is false and data exists, we send the data to our state to use
  useEffect(() => {
    if (!loading && data) {
      const multipleMetrics = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          multipleMetrics.push(parseMultipleMetric(data[key][0]));
        }
      }

      if (containerRef.current) {
        setGraphWidth(containerRef.current.clientWidth - 48);
        setGraphHeight(containerRef.current.clientHeight - 48);
      }

      dispatch(actions.updateMultipleMetrics(multipleMetrics));
    }
    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  return (
    <div className={classes.container} ref={containerRef}>
      {!!metricsData.length && (
        <Plot
          data={metricsData.map((metric, idx) => {
            return {
              x: metric.measurements.map(measurement => new Date(measurement.at)),
              y: metric.measurements.map(measurement => measurement.value),
              type: 'scatter',
              mode: 'lines',
              marker: { color: graphColors[idx] },
              yaxis: `yaxis${idx + 1}`,
              name: metric.metric,
            };
          })}
          config={{ responsive: true }}
          layout={{
            width: graphWidth,
            height: graphHeight,
            borderRadius: '8px',
            ...createAxis(metricsData, graphColors),
          }}
        />
      )}
    </div>
  );
};
