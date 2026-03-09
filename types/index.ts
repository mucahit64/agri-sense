export interface User {
  id: number
  name: string
  surname: string
  username: string
  mail: string
  phone: string | null
  language: string | null
  country: string | null
  is_active: number
  last_login_at: string | null
  password_hash: string
  created_at: string | null
  updated_at: string | null
}

export interface Field {
  id: number
  user_id: number
  name: string | null
  lat: number | null
  lon: number | null
  area_m2: number | null
  soil_type: string | null
  is_active: number
  created_at: string | null
  updated_at: string | null
}

export interface Device {
  id: number
  user_id: number
  field_id: number | null
  name: string | null
  type: string | null
  status: number
  location: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Sensor {
  id: number
  device_id: number
  name: string | null
  type_id: number
  unit_id: number
  min_value: number | null
  max_value: number | null
  created_at: string | null
  updated_at: string | null
  // Joined fields
  type_name?: string
  type_label?: string
  type_icon?: string
  unit_name?: string
  unit_symbol?: string
}

export interface SensorType {
  id: number
  name: string
  label: string
  icon: string | null
  created_at: string | null
}

export interface Unit {
  id: number
  sensor_type_id: number
  name: string
  symbol: string
  is_default: number
  created_at: string | null
}

export interface Reading {
  id: number
  sensor_id: number
  value: number
  created_at: string | null
  recorded_at: string | null
}

export interface Weather {
  id: number
  field_id: number
  source: string | null
  data: string | null
  recorded_at: string | null
  created_at: string | null
}

export interface AiDecision {
  id: number
  field_id: number
  decision: string | null
  reason: string | null
  confidence: number | null
  input_data: string | null
  created_at: string | null
}

export interface DeviceAssignment {
  id: number
  device_id: number
  field_id: number
  user_id: number
  assigned_at: string | null
  unassigned_at: string | null
}

export interface DeviceCreate {
  name: string
  type?: string
  status?: number
  location?: string
  field_id?: number
}

export interface FieldCreate {
  name: string
  lat?: number
  lon?: number
  area_m2?: number
  soil_type?: string
}

export interface SensorCreate {
  device_id: number
  name: string
  type_id: number
  unit_id: number
  min_value?: number
  max_value?: number
}

export interface ReadingCreate {
  sensor_id: number
  value: number
  recorded_at?: string
}

export interface SensorPayload {
  device_name: string
  sensor_name: string
  sensor_type: string
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
