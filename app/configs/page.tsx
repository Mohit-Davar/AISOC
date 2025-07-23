
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";
import { Factory, MapPin, Camera, Users, Plus } from "lucide-react";
import toast from 'react-hot-toast';

// Factory Schema
const factorySchema = z.object({
  name: z.string().min(1, "Factory name is required"),
});
type FactoryFormData = z.infer<typeof factorySchema>;

// Location Schema
const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  factoryId: z.number().int().positive("Factory must be selected"),
});
type LocationFormData = z.infer<typeof locationSchema>;

// Camera Schema
const cameraSchema = z.object({
  name: z.string().min(1, "Camera name is required"),
  streamUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  locationId: z.number().int().positive("Location must be selected"),
});
type CameraFormData = z.infer<typeof cameraSchema>;

// Worker Schema
const workerSchema = z.object({
  name: z.string().min(1, "Worker name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().optional(),
  factoryId: z.number().int().positive("Factory must be selected"),
});
type WorkerFormData = z.infer<typeof workerSchema>;

const AddFactoryForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FactoryFormData>({
    resolver: zodResolver(factorySchema),
  });

  const addFactoryMutation = useMutation({
    mutationFn: async (data: FactoryFormData) => {
      const res = await fetch('/api/configs/factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add factory');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      toast.success('Factory added successfully!');
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: FactoryFormData) => {
    addFactoryMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <CardHeader className="text-xl font-semibold">Add New Factory</CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name")}
              label="Factory Name"
              placeholder="Enter factory name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              fullWidth
            />
          </div>
          <Button type="submit" color="primary" isLoading={isSubmitting || addFactoryMutation.isPending}>
            {isSubmitting || addFactoryMutation.isPending ? <Spinner size="sm" color="white" /> : <Plus size={18} />} Add Factory
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

interface FactoryOption {
  id: number;
  name: string;
}

const fetchFactories = async (): Promise<FactoryOption[]> => {
  const res = await fetch('/api/configs/factories');
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch factories');
  }
  return res.json();
};

const AddLocationForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  const { data: factories, isLoading: isLoadingFactories, isError: isErrorFactories, error: factoriesError } = useQuery<FactoryOption[], Error>({
    queryKey: ['factories'],
    queryFn: fetchFactories,
  });

  const addLocationMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const res = await fetch('/api/configs/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add location');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] }); // Invalidate locations query for potential future use
      toast.success('Location added successfully!');
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: LocationFormData) => {
    addLocationMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <CardHeader className="text-xl font-semibold">Add New Location</CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name")}
              label="Location Name"
              placeholder="Enter location name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              fullWidth
            />
          </div>
          <div>
            <Select
              {...register("factoryId", { valueAsNumber: true })}
              label="Select Factory"
              placeholder="Choose a factory"
              isInvalid={!!errors.factoryId}
              errorMessage={errors.factoryId?.message}
              fullWidth
              isLoading={isLoadingFactories}
              isDisabled={isLoadingFactories || isErrorFactories}
            >
              {factories?.map((factory) => (
                <SelectItem key={factory.id} value={factory.id.toString()}>
                  {factory.name}
                </SelectItem>
              ))}
            </Select>
            {isErrorFactories && <p className="text-red-500 text-sm mt-1">Error loading factories: {factoriesError?.message}</p>}
          </div>
          <Button type="submit" color="primary" isLoading={isSubmitting || addLocationMutation.isPending}>
            {isSubmitting || addLocationMutation.isPending ? <Spinner size="sm" color="white" /> : <Plus size={18} />} Add Location
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

interface LocationOption {
  id: number;
  name: string;
}

const fetchLocations = async (factoryId: number): Promise<LocationOption[]> => {
  if (!factoryId) return [];
  const res = await fetch(`/api/configs/locations?factoryId=${factoryId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch locations');
  }
  return res.json();
};

const AddCameraForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CameraFormData>({
    resolver: zodResolver(cameraSchema),
  });

  const selectedFactoryId = watch('factoryId'); // Watch for changes in factory selection

  const { data: factories, isLoading: isLoadingFactories, isError: isErrorFactories, error: factoriesError } = useQuery<FactoryOption[], Error>({
    queryKey: ['factories'],
    queryFn: fetchFactories,
  });

  const { data: locations, isLoading: isLoadingLocations, isError: isErrorLocations, error: locationsError } = useQuery<LocationOption[], Error>({
    queryKey: ['locations', selectedFactoryId], // Query depends on selectedFactoryId
    queryFn: () => fetchLocations(selectedFactoryId as number), // Cast to number as it can be undefined initially
    enabled: !!selectedFactoryId, // Only run query if factoryId is selected
  });

  const addCameraMutation = useMutation({
    mutationFn: async (data: CameraFormData) => {
      const res = await fetch('/api/configs/camera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add camera');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] }); // Invalidate cameras query for potential future use
      toast.success('Camera added successfully!');
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: CameraFormData) => {
    addCameraMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <CardHeader className="text-xl font-semibold">Add New Camera</CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name")}
              label="Camera Name"
              placeholder="Enter camera name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              fullWidth
            />
          </div>
          <div>
            <Input
              {...register("streamUrl")}
              label="Stream URL (Optional)"
              placeholder="Enter camera stream URL"
              isInvalid={!!errors.streamUrl}
              errorMessage={errors.streamUrl?.message}
              fullWidth
            />
          </div>
          <div>
            <Select
              {...register("factoryId", { valueAsNumber: true })} // Add factoryId to schema for selection
              label="Select Factory"
              placeholder="Choose a factory"
              isInvalid={!!errors.factoryId}
              errorMessage={errors.factoryId?.message}
              fullWidth
              isLoading={isLoadingFactories}
              isDisabled={isLoadingFactories || isErrorFactories}
            >
              {factories?.map((factory) => (
                <SelectItem key={factory.id} value={factory.id.toString()}>
                  {factory.name}
                </SelectItem>
              ))}
            </Select>
            {isErrorFactories && <p className="text-red-500 text-sm mt-1">Error loading factories: {factoriesError?.message}</p>}
          </div>
          <div>
            <Select
              {...register("locationId", { valueAsNumber: true })}
              label="Select Location"
              placeholder="Choose a location"
              isInvalid={!!errors.locationId}
              errorMessage={errors.locationId?.message}
              fullWidth
              isLoading={isLoadingLocations}
              isDisabled={isLoadingLocations || isErrorLocations || !selectedFactoryId}
            >
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </Select>
            {isErrorLocations && <p className="text-red-500 text-sm mt-1">Error loading locations: {locationsError?.message}</p>}
          </div>
          <Button type="submit" color="primary" isLoading={isSubmitting || addCameraMutation.isPending}>
            {isSubmitting || addCameraMutation.isPending ? <Spinner size="sm" color="white" /> : <Plus size={18} />} Add Camera
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

const AddWorkerForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
  });

  const { data: factories, isLoading: isLoadingFactories, isError: isErrorFactories, error: factoriesError } = useQuery<FactoryOption[], Error>({
    queryKey: ['factories'],
    queryFn: fetchFactories,
  });

  const addWorkerMutation = useMutation({
    mutationFn: async (data: WorkerFormData) => {
      const res = await fetch('/api/configs/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add worker');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] }); // Invalidate workers query for potential future use
      toast.success('Worker added successfully!');
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: WorkerFormData) => {
    addWorkerMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <CardHeader className="text-xl font-semibold">Add New Worker</CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name")}
              label="Worker Name"
              placeholder="Enter worker name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
              fullWidth
            />
          </div>
          <div>
            <Input
              {...register("employeeId")}
              label="Employee ID"
              placeholder="Enter employee ID"
              isInvalid={!!errors.employeeId}
              errorMessage={errors.employeeId?.message}
              fullWidth
            />
          </div>
          <div>
            <Input
              {...register("department")}
              label="Department (Optional)"
              placeholder="Enter department"
              fullWidth
            />
          </div>
          <div>
            <Select
              {...register("factoryId", { valueAsNumber: true })}
              label="Select Factory"
              placeholder="Choose a factory"
              isInvalid={!!errors.factoryId}
              errorMessage={errors.factoryId?.message}
              fullWidth
              isLoading={isLoadingFactories}
              isDisabled={isLoadingFactories || isErrorFactories}
            >
              {factories?.map((factory) => (
                <SelectItem key={factory.id} value={factory.id.toString()}>
                  {factory.name}
                </SelectItem>
              ))}
            </Select>
            {isErrorFactories && <p className="text-red-500 text-sm mt-1">Error loading factories: {factoriesError?.message}</p>}
          </div>
          <Button type="submit" color="primary" isLoading={isSubmitting || addWorkerMutation.isPending}>
            {isSubmitting || addWorkerMutation.isPending ? <Spinner size="sm" color="white" /> : <Plus size={18} />} Add Worker
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

const ConfigsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="font-bold text-3xl mb-6">Configuration Management</h1>
      <Tabs aria-label="Configuration Options" color="primary" variant="bordered">
        <Tab
          key="factory"
          title={
            <div className="flex items-center space-x-2">
              <Factory size={18} />
              <span>Factory</span>
            </div>
          }
        >
          <AddFactoryForm />
        </Tab>
        <Tab
          key="location"
          title={
            <div className="flex items-center space-x-2">
              <MapPin size={18} />
              <span>Location</span>
            </div>
          }
        >
          <AddLocationForm />
        </Tab>
        <Tab
          key="camera"
          title={
            <div className="flex items-center space-x-2">
              <Camera size={18} />
              <span>Camera</span>
            </div>
          }
        >
          <AddCameraForm />
        </Tab>
        <Tab
          key="worker"
          title={
            <div className="flex items-center space-x-2">
              <Users size={18} />
              <span>Worker</span>
            </div>
          }
        >
          <AddWorkerForm />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ConfigsPage;

export default ConfigsPage;
