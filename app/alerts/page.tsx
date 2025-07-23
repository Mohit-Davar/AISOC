"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface Alert {
  id: number;
  timestamp: string;
  alert_type: string;
  description: string;
  violation_id: number | null;
  factory_name: string;
}

const fetchAlerts = async (): Promise<Alert[]> => {
  const res = await fetch("/api/alerts");
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

const AlertsPage = () => {
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [factoryFilter, setFactoryFilter] = useState("");

  const { data: alerts, isLoading, isError, error } = useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(alerts?.map((alert) => alert.alert_type) || []));
  }, [alerts]);

  const uniqueFactories = useMemo(() => {
    return Array.from(new Set(alerts?.map((alert) => alert.factory_name) || []));
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts?.filter((alert) => {
      const matchesDate =
        !dateFilter || alert.timestamp.includes(dateFilter);
      const matchesType =
        !typeFilter || typeFilter === "all" || alert.alert_type === typeFilter;
      const matchesFactory =
        !factoryFilter ||
        factoryFilter === "all" ||
        alert.factory_name === factoryFilter;

      return matchesDate && matchesType && matchesFactory;
    }) || [];
  }, [dateFilter, typeFilter, factoryFilter, alerts]);

  const clearFilters = () => {
    setDateFilter("");
    setTypeFilter("");
    setFactoryFilter("");
  };

  return (
    <div className="p-6">
      <div className="space-y-6 mx-auto max-w-7xl">
        <h1 className="font-bold text-3xl">Alerts</h1>

        <Card>
          <CardHeader>
            <Filter className="size-5" />
            <span className="font-semibold text-lg">Filter Alerts</span>
          </CardHeader>
          <CardBody className="py-4">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-3">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <Select
                placeholder="Alert Type"
                startContent={<AlertTriangle className="size-4" />}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {uniqueTypes.map((type) => (
                  <SelectItem key={type}>{type}</SelectItem>
                ))}
              </Select>

              <Select
                placeholder="Factory"
                startContent={<MapPin className="size-4" />}
                value={factoryFilter}
                onChange={(e) => setFactoryFilter(e.target.value)}
              >
                {uniqueFactories.map((factory) => (
                  <SelectItem key={factory}>{factory}</SelectItem>
                ))}
              </Select>
            </div>

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

        <Card>
          <CardHeader className="pb-3">
            <Badge color="danger" content={filteredAlerts.length} size="lg">
              <Button
                startContent={<AlertTriangle className="w-4 h-4" />}
                variant="flat"
              >
                Alerts
              </Button>
            </Badge>
          </CardHeader>
          <CardBody className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner color="primary" size="lg" />
              </div>
            ) : (
              <Table aria-label="Alerts table">
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
                      FACTORY
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4" />
                      ALERT TYPE
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <div className="flex items-center gap-2">
                      <Info className="size-4" />
                      DESCRIPTION
                    </div>
                  </TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{alert.factory_name}</TableCell>
                      <TableCell>
                        <span className="bg-red-500 px-4 py-2 rounded-2xl text-white">
                          {alert.alert_type}
                        </span>
                      </TableCell>
                      <TableCell>{alert.description}</TableCell>
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

            {filteredAlerts.length === 0 && !isLoading && (
              <div className="py-8 text-gray-400 text-center">
                <Info className="opacity-50 mx-auto mb-4 w-12 h-12" />
                <p>No alerts found matching your filters.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AlertsPage;