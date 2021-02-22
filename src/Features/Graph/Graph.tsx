import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';
import { actions } from '../Graph/reducer';
import { LastKnownMetric, MultipleMetrics } from '../../utils/interfaces/Metrics';
import { isUnique, parseMultipleMetric } from '../../utils/common';
import StateInterface from '../../utils/interfaces/State';
import { withWidth } from '@material-ui/core';

interface PropTypes {
  items: LastKnownMetric[];
  width: string;
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

  const axisArr = filteredRanges.map((range, idx) => {
    const axisLayout = {
      title: range.type,
      autorange: false,
      anchor: idx > 1 ? 'free' : 'x',
      overlaying: 'y',
      side: idx % 2 === 0 ? 'left' : 'right',
      range: [range.min - 100, range.max + 100],
      type: 'linear',
      name: `yaxis${!!idx ? idx + 1 : ''}`,
      position: idx % 2 === 0 ? 0.85 : -0.85,
      coloraxis: {
        colorbar: {
          bgColor: idx > 1 ? 'white' : 'transparent',
        },
      },
    };
    axis[`yaxis${!!idx ? idx + 1 : ''}`] = axisLayout;
    return axisLayout;
  });

  return { axis, axisArr };
};

export default withWidth()((props: PropTypes) => {
  const dispatch = useDispatch();
  const { items, width } = props;
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphHeight, setGraphHeight] = useState<number>(0);
  const [graphWidth, setGraphWidth] = useState<number>(0);
  const [graphData, setGraphData] = useState<any>();
  const [graphLayout, setGraphLayout] = useState<any>();
  const { metricsData, graphColors, filters } = useSelector((state: StateInterface) => ({
    metricsData: state.metrics.metricsData,
    graphColors: state.metrics.graphColors,
    filters: state.metrics.filters,
  }));
  const { loading, error, data } = useQuery(
    gql`
      ${!!items.length ? generateQueryMultiples(items) : 'query Heartbeat { heartBeat }'}
    `,
    { skip: !items.length },
  );

  const resize = () => {
    // we get the container pixels to generate what size the chart should be
    if (containerRef.current) {
      const height = width === 'sm' ? 600 : width === 'xs' ? 400 : containerRef.current.clientHeight - 48;
      setGraphWidth(containerRef.current.clientWidth - 48);
      setGraphHeight(height);
    }
  };

  // If loading is false and data exists, we send the data to our state to use
  useEffect(() => {
    if (!loading && data) {
      const multipleMetrics = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          multipleMetrics.push(parseMultipleMetric(data[key][0]));
        }
      }

      window.addEventListener('resize', resize);
      resize();

      dispatch(actions.updateMultipleMetrics(multipleMetrics));
    }

    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: 'Could not obtain data for chart' }));
    }

    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  useEffect(() => {
    if (!!metricsData.length) {
      const filteredMetrics = !!filters.length ? metricsData.filter(metric => filters.indexOf(metric.metric) !== -1) : metricsData

      const axes = createAxes(filteredMetrics);
      const layout = {
        width: graphWidth,
        height: graphHeight,
        autosize: true,
        plot_bgcolor: 'transparent',
        paper_bgcolor: 'transparent',
        showlegend: width === 'xs' || width === 'sm' ? false : true,
        ...axes.axis,
      };

      const data = filteredMetrics.map((metric, idx) => {
        return {
          x: metric.measurements.map(measurement => new Date(measurement.at)),
          y: metric.measurements.map(measurement => measurement.value),
          type: 'scatter',
          mode: 'lines',
          marker: { color: graphColors[idx] },
          yaxis: axes.axisArr
            .filter((axis: any) => axis.title === metric.measurements[0].unit)[0]
            .name.split('axis')
            .join(''),
          name: metric.metric,
        };
      });

      setGraphData(data);
      setGraphLayout(layout);
    }
    return () => {};
    // eslint-disable-next-line
  }, [metricsData, filters]);

  return (
    <div className={classes.container} ref={containerRef}>
      <span style={{ backgroundColor: 'white' }}>
        {!!items.length && !!metricsData.length && (
          <Plot data={graphData} config={{ responsive: true }} layout={graphLayout} />
        )}
      </span>
    </div>
  );
});
