export interface Branch {
  id: string;
  name: string;
  city: string;
  code: string;
  isActive: boolean;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
