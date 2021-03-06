import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery, gql } from '@apollo/client';
import { Box, withWidth } from '@material-ui/core';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { actions } from '../Features/Graph/reducer';
import Multiselect from './Multiselect';
import StateInterface from '../utils/interfaces/State';
import Metrics from '../Features/Metrics/Metrics';
import Graph from '../Features/Graph/Graph';
import { generateRandomColor } from '../utils/common';

interface propTypes {
  width: string;
}

interface PropStyles {
  width: string;
}

const useStyles = makeStyles({
  container: (props: PropStyles) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: props.width === 'xs' || props.width === 'sm' ? 'auto' : '93%',
    boxSizing: 'border-box',
  }),
  innerContainer: (props: PropStyles) => ({
    display: 'flex',
    flexDirection: props.width === 'xs' || props.width === 'sm' ? 'column-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  }),
  componentContainer: (props: PropStyles) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: props.width === 'xs' || props.width === 'sm' ? '100%' : '50%',
    height: props.width === 'xs' || props.width === 'sm' ? 'auto' : '100%',
    padding: '16px',
  }),
});

const metricsQuery = gql`
  query Metrics {
    getMetrics
  }
`;

export default withWidth()((props: propTypes) => {
  const { width } = props;
  const dispatch = useDispatch();
  const classes = useStyles({ width });
  // initial query to get metric types
  const { loading, error, data } = useQuery(metricsQuery);
  // call state to get our current values
  const { metricTypes, selectedMetrics, metricsLastKnown, graphColors } = useSelector((state: StateInterface) => ({
    metricTypes: state.metrics.metricTypes,
    selectedMetrics: state.metrics.selectedMetrics,
    metricsLastKnown: state.metrics.metricsLastKnown,
    graphColors: state.metrics.graphColors,
  }));

  // If loading is false and data exists, we send the data to our state to use
  useEffect(() => {
    if (!loading && data) {
      const metrics = data.getMetrics.map((metric: string) => metric);
      dispatch(actions.metricsDataReceived(metrics));
    }
    return () => {};

    // We add this line to ignore the warning to add Dispatch to the dependency array since we do not want a render when this changes
    // eslint-disable-next-line
  }, [loading, error, data]);

  useEffect(() => {
    if (!graphColors.length && metricTypes.length) {
      const colors = [];
      for (let i = 0; i < metricTypes.length; i++) {
        colors.push(generateRandomColor());
      }
      dispatch(actions.setGraphColors(colors));
      toast('Click on a metric type to get started!', {
        position: 'top-left',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: 'Could not obtain metric data' }));
    }

    return () => {};

    // eslint-disable-next-line
  }, [metricTypes]);

  const updateSelectedItems = (items: string[]) => {
    dispatch(actions.updateSelectedMetrics(items));
  };

  return (
    <>
      <Box className={classes.container}>
        <Box className={classes.innerContainer} style={{ height: '30%' }}>
          <Box className={classes.componentContainer}>
            <Metrics items={selectedMetrics} />
          </Box>
          <Box className={classes.componentContainer} style={{ alignItems: 'flex-start' }}>
            {!!metricTypes.length && (
              <Multiselect
                selectedItems={selectedMetrics}
                options={metricTypes}
                setItemsParent={updateSelectedItems}
                title={'Metric Types'}
              />
            )}
          </Box>
        </Box>
        <Box className={classes.innerContainer} style={{ height: '70%' }}>
          <Graph items={metricsLastKnown} />
        </Box>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
});
