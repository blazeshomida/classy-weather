import "./index.css";
import { ReactNode, useState } from "react";
import getWeatherIcon from "./utils/getWeatherIcon";
import { formatDay } from "./utils/formatDay";
import { WeatherDataType, useWeather } from "./hooks/useWeather";

function App() {
  const [location, setLocation] = useState("");
  const { weather, displayLocation, isLoading, error } = useWeather(location);

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      {(error || displayLocation) && <p>{error || displayLocation}</p>}
      <input
        type="text"
        value={location}
        placeholder="Search from location..."
        onChange={(e) => setLocation(e.target.value)}
      />
      {isLoading && <p className="loader">Loading...</p>}

      {!error && weather && (
        <div>
          <h2>Weather For {weather.name}</h2>
          <Weather>
            {weather.dates.map((date: string, i: number) => (
              <Day weather={weather} key={date} index={i} date={date} />
            ))}
          </Weather>
        </div>
      )}
    </div>
  );
}

export default App;

function Weather({ children }: { children: ReactNode }) {
  return <ul className="weather">{children}</ul>;
}

function Day({
  weather,
  date,
  index,
}: {
  weather: WeatherDataType | undefined;
  date: string;
  index: number;
}) {
  if (!weather) return null;

  return (
    <li className="day">
      <span>{getWeatherIcon(weather.codes[index])}</span>
      <p>{index === 0 ? "Today" : formatDay(date)}</p>
      <p>
        {Math.floor(weather.min[index])}&deg; &mdash;
        <strong>{Math.ceil(weather.max[index])}&deg;</strong>
      </p>
    </li>
  );
}
