export interface Hotel {
  id: string;
  userId: string;
  name: string;
  rating: string;
  city: string;
  price: number;
  fileName: string;
  imageUrl?: string;
}

export interface HotelListResponse<T extends object> {
  data: {
    hotels: T[];
  };
}

// export interface HotelListResponse<T extends object> {
//   data: {
//     [K in keyof T]: T[];
//   };
// }
