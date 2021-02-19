import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { actions } from '../Graph/reducer';
import { LastKnownMetric } from '../../utils/interfaces/Metrics';
import { parseMultipleMetric } from '../../utils/common';
import StateInterface from '../../utils/interfaces/State';

interface PropTypes {
  items: LastKnownMetric[];
}

const useStyles = makeStyles({
  container: {
    width: '100%',
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

export default (props: PropTypes) => {
  const dispatch = useDispatch();
  const { items } = props;
  const classes = useStyles();
  const metricsData = useSelector((state: StateInterface) => state.metrics.metricsData);
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

      dispatch(actions.updateMultipleMetrics(multipleMetrics));
    }
    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  return <Box className={classes.container}></Box>;
};
