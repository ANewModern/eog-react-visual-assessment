import { spawn } from 'redux-saga/effects';
import metricSaga from '../Features/Graph/saga';

export default function* root() {
  yield spawn(metricSaga);
}
