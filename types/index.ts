export interface User {
  id: number
  name: string
  surname: string
  email: string
  password: string
  created_at: Date
}

export interface Device {
  id: number
  user_id: number
  device_uid: string
  device_name?: string
  is_active: boolean
  last_seen_at?: Date | null
  created_at: Date
}

export type SensorType
  = | 'temperature'
    | 'humidity'
    | 'soil_moisture'
    | 'ph'
    | 'light'
    | 'pressure'

export interface Sensor {
  id: number
  device_id: number
  sensor_uid: string
  sensor_type: SensorType
  name?: string
  pin?: string
  unit?: string
  min_value?: number
  max_value?: number
  created_at: Date
}

export interface Reading {
  id: number
  sensor_id: number
  value: number
  recorded_at: Date
  created_at: Date
}

export interface DeviceCreate {
  user_id: number
  device_uid: string
  device_name?: string
}

export interface SensorCreate {
  device_id: number
  sensor_uid: string
  sensor_type: SensorType
  name?: string
  pin?: string
  unit?: string
  min_value?: number
  max_value?: number
}

export interface ReadingCreate {
  sensor_id: number
  value: number
  recorded_at: Date
}

export interface SensorPayload {
  device_uid: string
  sensor_uid: string
  sensor_type: SensorType
  value: number
  recorded_at?: string
}

export interface WeatherForecastResponse {
  cod: string
  message: number
  cnt: number
  list: WeatherForecastItem[]
  city: City
}

export interface WeatherForecastItem {
  dt: number
  main: MainWeather
  weather: WeatherDescription[]
  clouds: Clouds
  wind: Wind
  visibility: number
  pop: number
  sys: Sys
  dt_txt: string
}

export interface WeatherForecastItem {
  dt: number
  main: MainWeather
  weather: WeatherDescription[]
  clouds: Clouds
  wind: Wind
  visibility: number
  pop: number
  sys: Sys
  dt_txt: string
}

export interface MainWeather {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  sea_level?: number
  grnd_level?: number
  humidity: number
  temp_kf?: number
}

export interface WeatherDescription {
  id: number
  main: string
  description: string
  icon: string
}

export interface Clouds {
  all: number
}

export interface Wind {
  speed: number
  deg: number
  gust?: number
}

export interface Sys {
  pod: 'd' | 'n'
}

export interface City {
  id: number
  name: string
  coord: Coord
  country: string
  population: number
  timezone: number
  sunrise: number
  sunset: number
}

export interface Coord {
  lat: number
  lon: number
}
