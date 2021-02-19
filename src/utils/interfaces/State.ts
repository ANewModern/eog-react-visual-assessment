import MetricsInterface from "./Metrics";
import WeatherInterface from "./Weather";

export default interface StateInterface {
  metrics: MetricsInterface;
  weather: WeatherInterface;
}
