"use client";
import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Spinner,
} from "@heroui/react";
import { Filter, X, Calendar, MapPin, AlertTriangle, Info } from "lucide-react";

const PastViolationsUI = () => {
  // Sample data
  const violationsData = [
    {
      id: 1,
      timestamp: "2025-06-14 19:15",
      location: "Main Entrance",
      type: "No Safety Helmet",
    },
    {
      id: 2,
      timestamp: "2025-06-14 18:42",
      location: "Warehouse Floor",
      type: "No Safety Boots",
    },
    {
      id: 3,
      timestamp: "2025-06-14 15:18",
      location: "Assembly Line",
      type: "No Safety Goggles",
    },
    {
      id: 4,
      timestamp: "2025-06-14 14:13",
      location: "Chemical Storage",
      type: "No Safety Boots",
    },
    {
      id: 5,
      timestamp: "2025-06-14 13:47",
      location: "Assembly Line",
      type: "No Safety Helmet",
    },
    {
      id: 6,
      timestamp: "2025-06-14 11:26",
      location: "Quality Control",
      type: "No Safety Boots",
    },
  ];

  // State management
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isLoading] = useState(false);

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(violationsData.map((v) => v.type)));
  const uniqueLocations = Array.from(
    new Set(violationsData.map((v) => v.location)),
  );

  // Filter violations based on current filters
  const filteredViolations = useMemo(() => {
    return violationsData.filter((violation) => {
      const matchesDate =
        !dateFilter || violation.timestamp.includes(dateFilter);
      const matchesType =
        !typeFilter || typeFilter === "all" || violation.type === typeFilter;
      const matchesLocation =
        !locationFilter ||
        locationFilter === "all" ||
        violation.location === locationFilter;

      return matchesDate && matchesType && matchesLocation;
    });
  }, [dateFilter, typeFilter, locationFilter, violationsData]);

  // Clear all filters
  const clearFilters = () => {
    setDateFilter("");
    setTypeFilter("");
    setLocationFilter("");
  };

  return (
    <div className="p-6">
      <div className="space-y-6 mx-auto max-w-7xl">
        {/* Header */}
        <h1 className="font-bold text-3xl">Past Violations</h1>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <Filter className="size-5" />
            <span className="font-semibold text-lg">Filter Violations</span>
          </CardHeader>
          <CardBody className="py-4">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-3">
              {/* Date Filter */}
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              {/* PPE Type Filter */}
              <Select
                placeholder="Violation"
                startContent={<AlertTriangle className="size-4" />}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {uniqueTypes.map((type) => (
                  <SelectItem key={type}>{type}</SelectItem>
                ))}
              </Select>

              {/* Camera Zone Filter */}
              <Select
                placeholder="Camera"
                startContent={<MapPin className="size-4" />}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                {uniqueLocations.map((location) => (
                  <SelectItem key={location}>{location}</SelectItem>
                ))}
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-4">
              <Button
                size="sm"
                startContent={<X className="size-4" />}
                variant="flat"
                onPress={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Recent Violations Table */}
        <Card>
          <CardHeader className="pb-3">
            <Badge color="danger" content={filteredViolations.length} size="lg">
              <Button
                startContent={<AlertTriangle className="w-4 h-4" />}
                variant="flat"
              >
                Violations
              </Button>
            </Badge>
          </CardHeader>
          <CardBody className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner color="primary" size="lg" />
              </div>
            ) : (
              <Table aria-label="Past violations table">
                <TableHeader>
                  <TableColumn>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      TIMESTAMP
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      CAMERA LOCATION
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4" />
                      VIOLATION TYPE
                    </div>
                  </TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {violation.timestamp}
                        </span>
                      </TableCell>
                      <TableCell>{violation.location}</TableCell>
                      <TableCell>
                        <span className="bg-red-500 px-4 py-2 rounded-2xl text-white">
                          {violation.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            color="primary"
                            radius="lg"
                            size="sm"
                            variant="flat"
                          >
                            Details
                          </Button>
                          <Button
                            color="success"
                            radius="lg"
                            size="sm"
                            variant="flat"
                          >
                            Resolve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredViolations.length === 0 && !isLoading && (
              <div className="py-8 text-gray-400 text-center">
                <Info className="opacity-50 mx-auto mb-4 w-12 h-12" />
                <p>No violations found matching your filters.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PastViolationsUI;
