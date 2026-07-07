import { Branch } from "@/types";

export const mockBranches: Branch[] = [
  {
    id: "branch-hyd",
    name: "Hyderabad Central",
    city: "Hyderabad",
    code: "HYD",
    isActive: true,
    address: "Road No. 36, Jubilee Hills, Hyderabad",
    coordinates: { lat: 17.4326, lng: 78.4071 },
  },
  {
    id: "branch-sdp",
    name: "Siddipet Main",
    city: "Siddipet",
    code: "SDP",
    isActive: true,
    address: "MG Road, Siddipet",
    coordinates: { lat: 18.1018, lng: 78.8520 },
  },
  {
    id: "branch-wgl",
    name: "Warangal Hub",
    city: "Warangal",
    code: "WGL",
    isActive: true,
    address: "Hanamkonda Road, Warangal",
    coordinates: { lat: 17.9784, lng: 79.5941 },
  },
];
