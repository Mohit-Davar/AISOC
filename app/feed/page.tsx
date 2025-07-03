"use client";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  CardBody,
  CardFooter,
  Divider,
  Input,
  Card,
  Chip,
} from "@heroui/react";

const cameraFeeds = [
  { location: "Main Entrance", status: "active" },
  { location: "Warehouse Exit", status: "inactive" },
  { location: "Front Gate", status: "active" },
  { location: "Rear Loading Zone", status: "active" },
];

export default function VisionAIDashboard() {
  const [selectedCamera, setSelectedCamera] = useState(cameraFeeds[0]);
  const [search, setSearch] = useState("");

  const filteredFeeds = cameraFeeds.filter((cam) =>
    cam.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="flex flex-col p-4 border-r w-64">
        <Input
          className="mb-4"
          placeholder="Search camera"
          radius="full"
          value={search}
          variant="bordered"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col gap-3 overflow-y-auto">
          {filteredFeeds.map((cam, index) => (
            <Card
              key={index}
              className={`p-1 transition-all duration-200 cursor-pointer border-2 rounded-xl
                ${selectedCamera.location === cam.location
                  ? "border-blue-500 bg-blue-100 text-black"
                  : "border-gray-200 "
                }`}
              isPressable={true}
              radius="lg"
              shadow="none"
              onPress={() => setSelectedCamera(cam)}
            >
              <CardBody>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{cam.location}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${cam.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                  />
                </div>
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
            <p className="font-semibold text-lg">{selectedCamera.location}</p>
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
        <Card radius="lg" shadow="sm">
          <CardBody className="flex justify-center items-center p-4 h-[500px]">
            <p>Live feed of {selectedCamera.location} will appear here</p>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-between">
            <div className="flex gap-2 text-green-500">
              <CheckCircle />
              <span className="text-primary">Vest</span>
            </div>
            <div className="flex gap-2 text-red-500">
              <XCircle />
              <span className="text-primary">Helmet</span>
            </div>
            <div className="flex gap-2 text-green-500">
              <CheckCircle />
              <span className="text-primary">Gloves</span>
            </div>
            <div className="flex gap-2 text-red-500">
              <XCircle />
              <span className="text-primary">Mask</span>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
