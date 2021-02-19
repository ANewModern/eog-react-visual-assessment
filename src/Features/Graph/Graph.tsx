import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles({
  container: {
    width: '100%',
    boxSizing: 'border-box',
  },
});

interface PropTypes {
  items: string[];
}

const generateQueryMultiples = (metrics: string[]) => {
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
  const currentTime = new Date().getTime();
  const halfHourBeforeTime = new Date(currentTime + -30 * 60000).getTime();

  return `
    query Measurements {
      ${metrics.map(metric => {
        const query = measurementsTemplate
          .replace('measurement', metric)
          .replace('currentTime', currentTime.toString())
          .replace('halfHourBeforeTime', halfHourBeforeTime.toString());
        return query;
      })}
    }
  `;
};

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
  const { items } = props;
  const classes = useStyles();
  const { loading, error, data } = useQuery(
    gql`
      ${generateQueryLastKnown(items)}
    `,
  );

  // If loading is false and data exists, we send the data to our state to use
  useEffect(() => {
    if (!loading && data) {
      console.log(data);
    }
    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  return <Box className={classes.container}></Box>;
};
