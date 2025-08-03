import UserRepository from '../repositories/DashboardRepository';
import { 
    DashboardResponse,
} from '../types/DashboardTypes';
import { GeneralResponse } from '../types/GeneralTypes';

class DashboardUseCase {
     
    async getDashboardInfo(signal?: AbortSignal): Promise<GeneralResponse<DashboardResponse>> {
        const response = await UserRepository.getUserProfileInfo(signal);
        return response;
    }
    
}

export default new DashboardUseCase();