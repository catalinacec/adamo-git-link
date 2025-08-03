import { Document } from "@/types";

export const documents: Document[] = [
  {
    id: 1,
    title: "Plan de Acción para la Sostenibilidad",
    date: "2021-03-12T14:23:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "sent",
    register: "",
  },
  {
    id: 2,
    title: "Contrato de alquileres - Franquicia",
    date: "2022-04-15T09:45:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "rejected",
          timestamp: "14/09/2024 a las 09:15 PM",
          helperText:
            "Fusce aliquam libero non venenatis lobortis. Vivamus euismod sollicitudin congue. Proin orci est, euismod nec nisi ut, faucibus dapibus diam. ",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "rejected",
    register: "process",
  },
  {
    id: 3,
    title: "Informe Anual 2123",
    date: "2023-05-09T16:10:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "completed",
          timestamp: "14/09/2024 a las 09:15 PM",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "completed",
          timestamp: "14/09/2024 a las 09:15 PM",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "completed",
    register: "completed",
  },
  {
    id: 4,
    title: "Plan de Proyecto Innovador",
    date: "2024-06-11T08:30:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "sent",
    register: "process",
  },
  {
    id: 5,
    title: "Resumen de Ventas del Trimestre",
    date: "2020-07-22T11:55:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "completed",
    register: "process",
  },
  {
    id: 6,
    title: "Estrategia de Marketing Digital",
    date: "2021-08-30T20:15:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "completed",
    register: "success",
  },
  {
    id: 7,
    title: "Acta de Reunión del Equipo",
    date: "2022-09-14T07:40:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "inProgress",
    register: "process",
  },
  {
    id: 8,
    title: "Propuesta de Colaboración",
    date: "2023-10-05T15:20:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "sent",
    register: "process",
  },
  {
    id: 9,
    title: "Análisis de Competencia",
    date: "2024-11-18T18:05:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "inProgress",
    register: "process",
  },
  {
    id: 10,
    title: "Guía de Usuario del Software",
    date: "2020-01-27T13:00:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "completed",
    register: "process",
  },
  {
    id: 11,
    title: "Guía de Usuario del Software dev",
    date: "2024-12-04T10:45:00.000Z",
    participants: [
      {
        id: 1,
        photo: "/participante-photo.png",
        firstName: "Juan Martín",
        lastName: "Gonzalez",
        email: "juanmagonzalez92@gmail.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7301643fd0",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
      {
        id: 2,
        photo: "/participante-photo-2.png",
        firstName: "María Laura Diaz",
        lastName: "Gonzalez",
        email: "marialauradg@adamoservices.com",
        docUrl:
          "https://adamosign.com/docuemnto/ce50f329-6f34-4e26-8440-5a7311293jh9",
        status: {
          id: "waiting",
          timestamp: "",
          helperText: "",
        },
        color: "#FF5733",  // Add a color value here
        listContact: false
      },
    ],
    status: "completed",
    register: "process",
  },
];
