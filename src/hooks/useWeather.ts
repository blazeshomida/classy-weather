import { useEffect, useState } from "react";
import { useLoading } from "./useLoading";
import { convertToFlag } from "../utils/convertToFlag";


export type WeatherDataType = {
    name: string;
    max: number[];
    min: number[];
    dates: string[];
    codes: number[];
  };
export const useWeather = (location: string) => {
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
  
          if (!geoData.results) throw new Error(`Location not found ${location}`);
  
          const { latitude, longitude, timezone, name, country_code } =
            geoData.results.at(0);
  
          setDisplayLocation(`${name} ${convertToFlag(country_code)}`);
  
          // 2) Getting actual weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}${
              timezone ? `&timezone=${timezone}` : ""
            }&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
  
          if (!weatherRes.ok) {
            throw new Error(`Unable to determine weather for ${name}  ${convertToFlag(country_code)}`)
          }
  
          const data = await weatherRes.json();
          const {
            temperature_2m_max: max = [],
            temperature_2m_min: min = [],
            time: dates = [],
            weathercode: codes = [],
          } = data.daily;
  
  
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

    return {weather, displayLocation, isLoading, error}
}