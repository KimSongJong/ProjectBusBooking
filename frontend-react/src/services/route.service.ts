import api from "@/config/axios"
import type { Route, CreateRouteRequest, UpdateRouteRequest } from "@/types/route.types"
import type { ApiResponse } from "@/types/auth.types"

class RouteService {
  async getAllRoutes(): Promise<ApiResponse<Route[]>> {
    return await api.get<ApiResponse<Route[]>>('/routes')
  }

  async getRouteById(id: number): Promise<ApiResponse<Route>> {
    return await api.get<ApiResponse<Route>>(`/routes/${id}`)
  }

  async createRoute(routeData: CreateRouteRequest): Promise<ApiResponse<Route>> {
    return await api.post<ApiResponse<Route>>('/routes', routeData)
  }

  async updateRoute(id: number, routeData: UpdateRouteRequest): Promise<ApiResponse<Route>> {
    return await api.put<ApiResponse<Route>>(`/routes/${id}`, routeData)
  }

  async deleteRoute(id: number): Promise<ApiResponse<null>> {
    return await api.delete<ApiResponse<null>>(`/routes/${id}`)
  }
}

const routeService = new RouteService()
export default routeService
