import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery, gql } from '@apollo/client';
import { Box } from '@material-ui/core';
import { actions } from '../Features/Graph/reducer';
import Multiselect from './Multiselect';
import StateInterface from '../utils/interfaces/State';

const useStyles = makeStyles({
  container: {
    width: '100%',
    boxSizing: 'border-box',
  },
});

const metricsQuery = gql`
  query Metrics {
    getMetrics
  }
`;

export default () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { loading, error, data } = useQuery(metricsQuery);
  const { metricTypes, selectedMetrics } = useSelector((state: StateInterface) => ({
    metricTypes: state.metrics.metricTypes,
    selectedMetrics: state.metrics.selectedMetrics,
  }));

  useEffect(() => {
    if (!loading && data) {
      const metrics = data.getMetrics.map((metric: string) => metric);
      dispatch(actions.metricsDataReceived(metrics));
    }
    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  const setItems = (items: string[]) => {
    dispatch(actions.updateSelectedMetrics(items));
  };

  return (
    <Box className={classes.container}>
      {!!metricTypes.length && (
        <Multiselect selectedItems={selectedMetrics} options={metricTypes} setItemsParent={setItems} title={'Metric Types'} />
      )}
    </Box>
  );
};
