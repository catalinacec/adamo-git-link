import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        // Mock data matching GitHub structure
        const mockData = {
          welcomeMessage: "¡Hola, María Laura!",
          plan: "Plan Básico",
          documents: {
            completed: 13411,
            rejected: 671,
            in_progress: 2510,
            draft: 0,
            pending: 0,
            recycler: 0
          },
          totalDocuments: 381,
          notifications: {
            unread: 3
          }
        };
        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">{dashboardData?.welcomeMessage || "¡Bienvenida María Laura!"}</h1>
        <p className="text-gray-600 text-base">
          Todo lo que necesitas está aquí, en una plataforma diseñada para simplificar tu gestión documental.
        </p>
      </div>

      {/* Documents Sent Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? '...' : `${dashboardData?.totalDocuments || 381} Documentos enviados`}
            </h2>
            <p className="text-gray-500 text-sm">Documentos que aún no han sido firmados</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="primary"
              size="large"
              onClick={() => navigate('/documents')}
            >
              Ver documentos
            </Button>
            <Button 
              variant="secondary"
              size="large"
              onClick={() => navigate('/documents/new')}
            >
              Nuevo documento
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completed Documents */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {isLoading ? '...' : (dashboardData?.documents?.completed || 13411).toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">Documentos finalizados</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
              onClick={() => navigate('/documents?status=completed')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver documentos
            </Button>
          </CardContent>
        </Card>

        {/* Rejected Documents */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {isLoading ? '...' : (dashboardData?.documents?.rejected || 671).toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">Documentos rechazados</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
              onClick={() => navigate('/documents?status=rejected')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver documentos
            </Button>
          </CardContent>
        </Card>

        {/* Pending Documents */}
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {isLoading ? '...' : (dashboardData?.documents?.in_progress || 2510).toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">Documentos en proceso</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium"
              onClick={() => navigate('/documents?status=pending')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver documentos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;