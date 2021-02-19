import { reducer as metricsReducer } from '../Features/Graph/reducer';
import { reducer as weatherReducer } from '../Features/Weather/reducer';

export default {
  metrics: metricsReducer,
  weather: weatherReducer,
};
