import axiosInstance from "../axiosInstance";
import {
    DashboardResponse,
} from "../types/DashboardTypes";
import { GeneralResponse } from "../types/GeneralTypes";

class DashboardRepository {

    async getUserProfileInfo(
        signal?: AbortSignal,
    ): Promise<GeneralResponse<DashboardResponse>> {
        const response = await axiosInstance.get<GeneralResponse<DashboardResponse>>(
            "/dashboard/welcome-stats",
            { signal }
        );
        return response.data;
    }
}

export default new DashboardRepository();