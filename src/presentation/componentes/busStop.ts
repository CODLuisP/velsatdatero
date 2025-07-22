export interface BusStop {
  id: string;
  name: string;
  description: string;
  arrivalTime: string;
  estimatedTime: string;
  actualTime?: string;
  duration: string;
  icon: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isTerminal?: boolean;
  isSkipped?: boolean;
  isIntermediate?: boolean;
  intermediateStartTime?: Date;
  radioGeocerca: number;
}