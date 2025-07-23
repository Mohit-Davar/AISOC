"use client";
import { useState } from "react";

import { CheckCircle, XCircle } from "lucide-react";

import {
  Card, CardBody, CardFooter, Chip, Divider, Input, Spinner,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

interface Camera {
  id: number;
  name: string;
  status: string;
  factoryId: number;
  factoryName: string;
  locationId: number;
  locationName: string;
}

interface Location {
  id: number;
  name: string;
  cameras: Camera[];
}

interface Factory {
  id: number;
  name: string;
  locations: { [key: number]: Location };
}

const fetchCameraFeeds = async (): Promise<Camera[]> => {
  const res = await fetch("/api/feed");
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();

  const flattenedCameras: Camera[] = [];
  data.forEach((factory: any) => {
    Object.values(factory.locations).forEach((location: any) => {
      location.cameras.forEach((camera: any) => {
        flattenedCameras.push({
          id: camera.id,
          name: camera.name,
          status: camera.status,
          factoryId: factory.id,
          factoryName: factory.name,
          locationId: location.id,
          locationName: location.name,
        });
      });
    });
  });
  return flattenedCameras;
};

export default function VisionAIDashboard() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useQuery<Camera[], Error>({
    queryKey: ["cameraFeeds"],
    queryFn: fetchCameraFeeds,
    onSuccess: (data) => {
      if (data.length > 0) {
        setSelectedCamera(data[0]);
        
      }
    },
  });

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  const filteredCameras = data?.filter(
    (cam) =>
      cam.name.toLowerCase().includes(search.toLowerCase()) ||
      cam.locationName.toLowerCase().includes(search.toLowerCase()) ||
      cam.factoryName.toLowerCase().includes(search.toLowerCase()),
  ) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Loading camera feeds..." color="primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error?.message}
      </div>
    );
  }

  if (!selectedCamera) {
    return (
      <div className="flex justify-center items-center h-screen">
        No camera feeds available.
      </div>
    );
  }


  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="flex flex-col p-4 border-r w-64">
        <Input
          className="mb-4"
          placeholder="Search cameras, locations, factories..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          clearable
          bordered
        />
        <div className="flex flex-col gap-3 overflow-y-auto">
          {filteredCameras.map((cam) => (
            <Card
              key={cam.id}
              isPressable
              isHoverable
              radius="lg"
              shadow="sm"
              className={`p-3 transition-all duration-200
                ${selectedCamera?.id === cam.id
                  ? "border-2 border-blue-500 bg-blue-100 text-black"
                  : "border-2 border-transparent hover:border-gray-300"
                }`}
              onPress={() => handleCameraSelect(cam)}
            >
              <CardBody className="flex flex-row justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{cam.name}</span>
                  <span className="text-gray-500 text-sm">
                    {cam.factoryName} &gt; {cam.locationName}
                  </span>
                </div>
                <Chip
                  size="sm"
                  variant="dot"
                  color={cam.status === "active" ? "success" : "default"}
                >
                  {cam.status.charAt(0).toUpperCase() + cam.status.slice(1)}
                </Chip>
              </CardBody>
            </Card>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="font-semibold text-lg">
              {selectedCamera.factoryName} &gt; {selectedCamera.locationName} &gt; {selectedCamera.name}
            </p>
          </div>
          <Chip
            color={selectedCamera.status === "active" ? "success" : "default"}
            variant="dot"
          >
            {selectedCamera.status.charAt(0).toUpperCase() +
              selectedCamera.status.slice(1)}
          </Chip>
        </div>

        {/* Placeholder for Camera Feed */}
        <Card className="w-full h-[600px]" radius="lg" shadow="sm">
          <CardBody className="flex justify-center items-center p-4 h-full">
            <p className="text-gray-500 text-lg">Live feed of {selectedCamera.name} will appear here</p>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-around p-4">
            <Chip startContent={<CheckCircle size={18} />} variant="flat" color="success">
              Vest
            </Chip>
            <Chip startContent={<XCircle size={18} />} variant="flat" color="danger">
              Helmet
            </Chip>
            <Chip startContent={<CheckCircle size={18} />} variant="flat" color="success">
              Gloves
            </Chip>
            <Chip startContent={<XCircle size={18} />} variant="flat" color="danger">
              Mask
            </Chip>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}