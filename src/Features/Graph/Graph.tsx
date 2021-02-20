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


// this generates the query for metrics the user has selected from which the interval of time gathered is between the time of the last known measurement and 30 minutes before that
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

// here we create the object properties for the axes (single or multiple)
// currently, this will not render multiple axes. Whether this is an issue with the library or an implementation issue I am causing I am unsure.
// I submitted an issue on the react-plotly repository to get more insight https://github.com/plotly/react-plotly.js/issues/232
const createAxes = (metrics: MultipleMetrics[]) => {
  const types: string[] = metrics.map(metric => metric.measurements[0].unit).filter(isUnique);
  const unfilteredRanges: { min: number; max: number; type: string }[] = metrics.map(metric => ({
    min: Math.min(...metric.measurements.map(measurement => measurement.value)),
    max: Math.max(...metric.measurements.map(measurement => measurement.value)),
    type: metric.measurements[0].unit,
  }));
  const axis: any = {};

  const filteredRanges = types.map(type => {
    const ranges = unfilteredRanges.filter(range => range.type === type);
    return {
      min: Math.min(...ranges.map(range => range.min)),
      max: Math.max(...ranges.map(range => range.max)),
      type,
    };
  });

  filteredRanges.map((range, idx) => {
    axis[`yaxis${idx + 1}`] = {
      title: range.type,
      autorange: true,
      anchor: 'x',
      overlaying: 'y',
      side: 'left',
      position: 0.15 * idx,
      range: [range.min - 100, range.max + 100],
      type: 'linear',
    };
    return range;
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

      // we get the container pixels to generate what size the chart should be
      if (containerRef.current) {
        setGraphWidth(containerRef.current.clientWidth - 48);
        setGraphHeight(containerRef.current.clientHeight - 48);
      }

      dispatch(actions.updateMultipleMetrics(multipleMetrics));
    }

    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: 'Could not obtain data for chart' }));
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
            ...createAxes(metricsData),
          }}
        />
      )}
    </div>
  );
};
