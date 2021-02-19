import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { actions } from '../Graph/reducer';
import StateInterface from '../../utils/interfaces/State';

interface PropTypes {
  items: string[];
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
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
    margin: '16px',
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

export default (props: PropTypes) => {
  const dispatch = useDispatch();
  const { items } = props;
  const classes = useStyles();
  const metricsLastKnown = useSelector((state: StateInterface) => state.metrics.metricsLastKnown);

  gql`
    ${generateQueryLastKnown(items)}
  `;
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
          lastKnownMetrics.push({
            at: data[key].at,
            metric: data[key].metric,
            unit: data[key].unit,
            value: data[key].value,
          });
        }
      }

      dispatch(actions.updateLastKnown(lastKnownMetrics));
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
};
