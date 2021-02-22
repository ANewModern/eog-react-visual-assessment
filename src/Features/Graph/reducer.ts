import { createSlice, PayloadAction } from 'redux-starter-kit';
import MetricState, { LastKnownMetric, MultipleMetrics } from '../../utils/interfaces/Metrics';

export type ApiErrorAction = {
  error: string;
};

const initialState: MetricState = {
  metricTypes: [],
  selectedMetrics: [],
  metricsData: [],
  metricsLastKnown: [],
  graphColors: [],
  filters: [],
};

const slice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    metricsDataReceived: (state, action: PayloadAction<Array<string>>) => {
      state.metricTypes = action.payload;
    },
    updateSelectedMetrics: (state, action: PayloadAction<Array<string>>) => {
      state.selectedMetrics = action.payload;
    },
    updateLastKnown: (state, action: PayloadAction<Array<LastKnownMetric>>) => {
      state.metricsLastKnown = action.payload;
    },
    updateMultipleMetrics: (state, action: PayloadAction<Array<MultipleMetrics>>) => {
      state.metricsData = action.payload;
    },
    setGraphColors: (state, action: PayloadAction<Array<string>>) => {
      state.graphColors = action.payload;
    },
    setMetricFilters: (state, action: PayloadAction<Array<string>>) => {
      state.filters = action.payload;
    },
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const reducer = slice.reducer;
export const actions = slice.actions;
