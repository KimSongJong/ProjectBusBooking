import api from "@/config/axios";
import type { Schedule } from "@/types/schedule.types";
import type { ApiResponse } from "@/types/auth.types";

class ScheduleService {
  async getScheduleRoutes(): Promise<ApiResponse<Schedule[]>> {
    return await api.get<ApiResponse<Schedule[]>>("/trips/schedule-routes");
  }
}

export default new ScheduleService();
