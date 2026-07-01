export interface Spot {
  id: string;
  name: string;
  location: string;
  image: string;
}

export interface Guide {
  id: string;
  name: string;
  rating: number;
  tripsCount: number;
  price: string;
  badges: string[];
  avatar: string;
  bio: string;
}
