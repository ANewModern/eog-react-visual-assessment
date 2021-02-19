import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Multiselect from './Multiselect';
import { Box } from '@material-ui/core';
import { useQuery, gql } from '@apollo/client';

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
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [selectItems, setSelectItems] = useState([]);
  const { loading, error, data } = useQuery(metricsQuery);

  useEffect(() => {
    if (!loading && data) {
      setSelectItems(data.getMetrics);
    }
    return () => {};
  }, [loading, error, data]);

  return (
    <Box className={classes.container}>
      {!loading && (
        <Multiselect selectedItems={items} options={selectItems} setItemsParent={setItems} title={'title'} />
      )}
    </Box>
  );
};
