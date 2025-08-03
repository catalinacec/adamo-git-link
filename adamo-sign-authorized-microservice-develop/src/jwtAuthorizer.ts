import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface APIGatewayEvent {
  headers: { [name: string]: string };
  routeArn: string;
}

interface PolicyDocument {
  Version: string;
  Statement: Array<{
    Action: string;
    Effect: string;
    Resource: string;
  }>;
}

interface AuthResponse {
  principalId: string;
  policyDocument: PolicyDocument;
  context: {
    user: string;
  };
}

export const handler = async (
  event: APIGatewayEvent
): Promise<AuthResponse> => {
  // Identificar preflight:
  // El navegador añade este header en OPTIONS preflight
  const isPreflight = !!(
    event.headers["Access-Control-Request-Method"] ||
    event.headers["access-control-request-method"]
  );

  if (isPreflight) {
    return {
      principalId: "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.routeArn,
          },
        ],
      },
      context: { user: "preflight" },
    };
  }

  console.log("Evento recibido:", JSON.stringify(event));
  const token = event.headers?.authorization?.split(" ")[1];

  if (!token) {
    console.warn("No token provided");
    return {
      principalId: "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.routeArn,
          },
        ],
      },
      context: {
        user: "Unauthorized",
      },
    };
  }

  try {
    const publicKey = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");

    console.log("Intentando verificar el token...");
    const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"] });

    console.log("Token verificado correctamente :", payload);

    return {
      principalId: typeof payload.sub === "string" ? payload.sub : "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.routeArn,
          },
        ],
      },
      context: {
        user: JSON.stringify(payload),
      },
    };
  } catch (err: any) {
    console.error("Error verificando el token:", err.message);

    // 🔴 Este es el cambio clave, devuelve una política de Deny en lugar de lanzar un Error:
    return {
      principalId: "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: event.routeArn,
          },
        ],
      },
      context: {
        user: "Unauthorized",
      },
    };
  }
};
