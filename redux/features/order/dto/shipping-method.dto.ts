export type TCreateShippingMethodDto = {
  code: string;
  name: string;
  description?: string;
  cost: number;
  estimatedDays: string;
};

export type TUpdateShippingMethodDto = {
  code?: string;
  name?: string;
  description?: string;
  cost?: number;
  estimatedDays?: string;
  isActive?: boolean;
};
