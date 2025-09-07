import axios from "axios";
import { ApiConfig } from "../config/ApiConfig"; 

const VisitTrucker = async () => {
  try {
    let visitorId = sessionStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      sessionStorage.setItem("visitorId", visitorId);
    }

    const visited = sessionStorage.getItem("visitTrucked");
    if (visited) {
      return; 
    }

    await axios.post(`${ApiConfig.API_URL}api/visits/track`, {
      visitorId,
    });

    sessionStorage.setItem("visitTrucked", "true");
  } catch (error) {
    console.error("Greška prilikom slanja posete:", error);
  }
};

export default VisitTrucker;
