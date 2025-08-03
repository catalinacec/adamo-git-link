export interface Participant {
  name: string;
  status: string;
  timestamp: string | null;
}

export const participants: Participant[] = [
  {
    name: "María Angeles Gómez (Tú)",
    status: "rejected",
    timestamp: "19/11/24, 06:18:42 PM",
  },
  {
    name: "Juan Martín Franzón",
    status: "signed",
    timestamp: "18/11/24, 09:48:33 AM",
  },
  {
    name: "Sofía Martínez",
    status: "pending",
    timestamp: null,
  },
  {
    name: "Diego López",
    status: "rejected",
    timestamp: "19/11/24, 06:18:42 PM",
  },
  {
    name: "Camila Torres Losada",
    status: "pending",
    timestamp: null,
  },
];
