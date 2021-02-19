import { createSlice, PayloadAction } from 'redux-starter-kit';
import MetricState, { LastKnownMetric } from '../../utils/interfaces/Metrics';

export type ApiErrorAction = {
  error: string;
};

const initialState: MetricState = {
  metricTypes: [],
  selectedMetrics: [],
  metricsData: [],
  metricsLastKnown: [],
};

const slice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    metricsDataReceived: (state, action: PayloadAction<Array<string>>) => {
      state.metricTypes = action.payload
    },
    updateSelectedMetrics: (state, action: PayloadAction<Array<string>>) => {
      state.selectedMetrics = action.payload
    },
    updateLastKnown: (state, action: PayloadAction<Array<LastKnownMetric>>) => {
      state.metricsLastKnown = action.payload
    },
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const reducer = slice.reducer;
export const actions = slice.actions;
