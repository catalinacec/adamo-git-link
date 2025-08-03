export type NotificationType = {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
};

export const notifications: NotificationType[] = [
  {
    id: "1",
    title: "Vestibulum mollis nunc a molestie dictum",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mollis nunc a molestie dictum. Mauris venenatis, felis scelerisque aliquet lacinia.",
    timeAgo: "Hace 1 minuto",
  },
  {
    id: "2",
    title: "Mauris venenatis fel",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mollis nunc a molestie dictum. Mauris venenatis, felis scelerisque aliquet lacinia.",
    timeAgo: "Hace 2 horas",
  },
  {
    id: "3",
    title: "Vestibulum mollis nunc a molestie dictum",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mollis nunc a molestie dictum. Mauris venenatis, felis scelerisque aliquet lacinia.",
    timeAgo: "Hace 1 día",
  },
  {
    id: "4",
    title: "Mauris venenatis fel",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mollis nunc a molestie dictum. Mauris venenatis, felis scelerisque aliquet lacinia.",
    timeAgo: "Hace 5 días",
  },
];
