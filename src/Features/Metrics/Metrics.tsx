import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, withWidth } from '@material-ui/core';
import { actions } from '../Graph/reducer';
import StateInterface from '../../utils/interfaces/State';
import { parseLastKnownMetric } from '../../utils/common';

interface PropTypes {
  items: string[];
  width: string;
}

interface PropStyles {
  width: string;
}

const useStyles = makeStyles({
  container: (props: PropStyles) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: props.width === 'xs' || props.width === 'sm' ? 'space-around' : 'flex-start',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  }),
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '200px',
    height: '100px',
    borderRadius: '8px',
    background: 'white',
    padding: '16px',
    margin: '8px',
  },
});

// This generates a query for the last known values of selected metrics
const generateQueryLastKnown = (metrics: string[]) => {
  const measurementsTemplate = `
    measurement: getLastKnownMeasurement(metricName: "measurement") {
      metric,
      at,
      value,
      unit,
    }
  `;

  return `
    query Measurements {
      ${metrics.map(metric => {
        const query = measurementsTemplate.replace('measurement', metric).replace('"measurement"', `"${metric}"`);
        return query;
      })}
    }
  `;
};

export default withWidth()((props: PropTypes) => {
  const dispatch = useDispatch();
  const { items, width } = props;
  const classes = useStyles({ width });
  const metricsLastKnown = useSelector((state: StateInterface) => state.metrics.metricsLastKnown);

  const { loading, error, data } = useQuery(
    gql`
      ${generateQueryLastKnown(items)}
    `,
    {
      pollInterval: 1000,
    },
  );

  // If loading is false and data exists, we send the data to our state to use
  useEffect(() => {
    if (!loading && data) {
      const lastKnownMetrics = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          lastKnownMetrics.push(parseLastKnownMetric(data[key]));
        }
      }

      dispatch(actions.updateLastKnown(lastKnownMetrics));
    }

    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: 'Could not obtain last known data for selected metrics' }));
    }

    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  return (
    <Box className={classes.container}>
      {metricsLastKnown.map((metric, idx) => (
        <Box key={`${metric.metric}-${idx}`} className={classes.card}>
          <Typography style={{ fontSize: '16px' }}>{metric.metric}</Typography>
          <Typography style={{ fontSize: '20px', fontWeight: 'bold' }}>{`${metric.value} ${metric.unit}`}</Typography>
        </Box>
      ))}
    </Box>
  );
});
