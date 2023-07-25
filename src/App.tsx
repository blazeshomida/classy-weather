import { useLoading } from "./hooks/useLoading";
import "./index.css";
import { ReactNode, useEffect, useState } from "react";
import { convertToFlag } from "./utils/convertToFlag";
import getWeatherIcon from "./utils/getWeatherIcon";
import { formatDay } from "./utils/formatDay";

type WeatherDataType = {
  name: string;
  max: number[];
  min: number[];
  dates: string[];
  codes: number[];
};

function App() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherDataType>();
  const [displayLocation, setDisplayLocation] = useState("");
  const [isLoading, setIsLoading] = useLoading();
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWeather() {
      setIsLoading(true);
      try {
        // 1) Getting location (geocoding)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
        );
        const geoData = await geoRes.json();

        if (!geoData.results) throw new Error("Location not found");

        const { latitude, longitude, timezone, name, country_code } =
          geoData.results.at(0);

        setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

        // 2) Getting actual weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}${
            timezone && `&timezone=${timezone}`
          }&daily=weathercode,temperature_2m_max,temperature_2m_min`
        );

        const response = await weatherRes.json();
        const {
          temperature_2m_max: max,
          temperature_2m_min: min,
          time: dates,
          weathercode: codes,
        } = response.daily;

        const weatherInfo = {
          name,
          min,
          max,
          dates,
          codes,
        };
        setWeather(weatherInfo);
        setError("");
      } catch (err) {
        if (typeof err === "string") setError(err);
        if (err instanceof Error) setError(err.message);
      }
      setIsLoading(false);
    }
    if (location.length < 2) {
      setDisplayLocation("");
      setWeather(undefined);
      setError("");
      return;
    }
    const fetchTimer = setTimeout(fetchWeather, 500);
    return () => {
      clearTimeout(fetchTimer);
    };
  }, [location, setIsLoading]);

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

      {weather && (
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
 if (!weather) return null

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
