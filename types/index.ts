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
  sensor_type: SensorType
  name?: string
  pin?: string
  unit?: string
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
  sensor_type: SensorType
  name?: string
  pin?: string
  unit?: string
}

export interface ReadingCreate {
  sensor_id: number
  value: number
  recorded_at: Date
}

export interface SensorPayload {
  device_uid: string
  sensor_type: SensorType
  value: number
  recorded_at?: string
}
