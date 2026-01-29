import type { GeoJSON } from "geojson"

export interface Range {
  id: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface District {
  id: string
  rangeId: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface SubDivision {
  id: string
  districtId: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface Station {
  id: string
  subDivisionId: string
  name: string
  code: string
  address: string
  lat?: number
  lng?: number
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  stationId: string
  name: string
  code: string
  address: string
  lat?: number
  lng?: number
  createdAt: string
  updatedAt: string
}

export interface Beat {
  id: string
  stationId: string
  postId?: string
  name: string
  code: string
  polygon?: GeoJSON.Polygon
  createdAt: string
  updatedAt: string
}

export interface HierarchyNode {
  id: string
  name: string
  code: string
  type: "range" | "district" | "subdivision" | "station" | "post" | "beat"
  parentId?: string
  children?: HierarchyNode[]
  data: Range | District | SubDivision | Station | Post | Beat
}

export type HierarchyLevel = "range" | "district" | "subdivision" | "station" | "post" | "beat"
