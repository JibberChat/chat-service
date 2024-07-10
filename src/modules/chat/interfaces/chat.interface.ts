export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}
