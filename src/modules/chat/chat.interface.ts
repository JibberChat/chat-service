export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    name: string;
  };
}
