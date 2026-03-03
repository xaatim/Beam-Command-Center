"use client";

import { ModeToggle } from "@/components/themeTogle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoElemt from "@/components/VideoElemt";
import { useRobotStatus } from "@/hooks/useRobotStatus";
import { useRobotStream } from "@/hooks/useRobotStream";
import { useSocketIo } from "@/hooks/useSocketIo";
import { alertRecord, userRobots } from "@/lib/serverq";
import { alertsQuery } from "@/queries/robot";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Battery,
  Camera,
  CheckCircle2,
  Clock,
  Lock,
  Mail,
  Settings,
  Shield,
  Unlock,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { type videoMode } from "../../types/types";

type AccessControlDashboardProps = {
  robot: userRobots;
};

// Simple mock data to keep the UI populated until real telemetry is wired.
const accessLog = [
  {
    id: 1,
    name: "Sarah Johnson",
    time: "2 min ago",
    status: "granted",
    location: "Main Entrance",
  },
  {
    id: 2,
    name: "Michael Chen",
    time: "5 min ago",
    status: "granted",
    location: "Restricted Area",
  },
  {
    id: 3,
    name: "Unknown Person",
    time: "12 min ago",
    status: "denied",
    location: "Restricted Area",
  },
  {
    id: 4,
    name: "Emily Davis",
    time: "18 min ago",
    status: "granted",
    location: "Main Entrance",
  },
  {
    id: 5,
    name: "John Smith",
    time: "23 min ago",
    status: "granted",
    location: "Main Entrance",
  },
];

const intruderAlerts = [
  { id: 1, time: "12 min ago", location: "Restricted Area", emailSent: true },
  { id: 2, time: "35 min ago", location: "Restricted Area", emailSent: true },
];

export function AccessControlDashboard({ robot }: AccessControlDashboardProps) {
  const { emit, isConnected } = useSocketIo();
  const { status, toggleRobotControl } = useRobotStatus(robot.serialNo);
  const [videoMode, setVideoMode] = useState<videoMode>("live_frame");
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery(
    alertsQuery(videoMode),
  );

  const streamUrl = useRobotStream({ selectedRobot: robot, videoMode });
  const [selectedAlert, setSelectedAlert] = useState<alertRecord | null>(null);

  useEffect(() => {
    if (!robot.serialNo || !isConnected) return;
    emit("robot:join", { serialNo: robot.serialNo });
  }, [emit, isConnected, robot.serialNo]);

  const connectionLabel = isConnected ? "Online" : "Offline";
  const controlMode = status ?? "manual";

  const stats = useMemo(
    () => [
      {
        label: "System Uptime",
        value: "99.9%",
        icon: CheckCircle2,
        trend: "Stable",
        color: "text-chart-4",
      },
      {
        label: "Access Today",
        value: "148",
        icon: Users,
        trend: "Door events",
        color: "text-accent",
      },
      {
        label: "Intruder Alerts",
        value: `${intruderAlerts.length}`,
        icon: AlertTriangle,
        trend: "Last 24h",
        color: "text-destructive",
      },
      {
        label: "Avg Response",
        value: "0.8s",
        icon: Clock,
        trend: "Recognition",
        color: "text-primary",
      },
    ],
    [],
  );

  return (
    <div className="h-full w-full bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-accent flex items-center justify-center">
              <Shield className="size-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {robot.customName || robot.modelRelation.model}
              </h1>
              <p className="text-xs text-muted-foreground">
                {robot.modelRelation.modelType} • Serial: {robot.serialNo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isConnected
                  ? "bg-chart-4/10 text-chart-4 border-chart-4/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }
            >
              {connectionLabel}
            </Badge>
            <ModeToggle />
            <Button variant="ghost" size="icon">
              <Settings className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="w-7xl mx-auto  py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.trend}</p>
                </div>
                <div
                  className={`size-12 rounded-lg bg-secondary/50 flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="size-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Live feed */}
            <div className="space-y-3">
              <Tabs defaultValue="restriction" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger
                    className="w-full"
                    value="restriction"
                    onClick={() => {
                      setVideoMode("restriction");
                    }}
                  >
                    Restriction
                  </TabsTrigger>

                  <TabsTrigger
                    className="w-full"
                    value="car_Identification"
                    onClick={() => {
                      setVideoMode("car_Identification");
                    }}
                  >
                    Car Identification
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="restriction">
                  <VideoElemt
                    robot={robot}
                    title="Restricted Area Feed"
                    streamUrl={streamUrl}
                  />
                </TabsContent>
                <TabsContent value="car_Identification">
                  <VideoElemt
                    robot={robot}
                    title="Parking Feed"
                    streamUrl={streamUrl}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Access log */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="size-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Access Log
                  </h2>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Last 24 hours
                </Badge>
              </div>
              <ScrollArea className="h-[360px] pr-4">
                <div className="space-y-3">
                  {accessLog.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center ${
                            log.status === "granted"
                              ? "bg-chart-4/20"
                              : "bg-destructive/20"
                          }`}
                        >
                          {log.status === "granted" ? (
                            <CheckCircle2 className="size-5 text-chart-4" />
                          ) : (
                            <AlertTriangle className="size-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {log.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            log.status === "granted" ? "outline" : "destructive"
                          }
                          className={
                            log.status === "granted"
                              ? "bg-chart-4/10 text-chart-4 border-chart-4/20"
                              : ""
                          }
                        >
                          {log.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                          <Clock className="size-3" />
                          {log.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Alerts */}

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Intruder Alerts
                  </h2>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {alerts?.length} Active
                </Badge>
              </div>
              {alerts && alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No alerts yet.</p>
              ) : (
                <ScrollArea className="h-80 pr-3">
                  <div className="space-y-3">
                    {(!alerts || isLoadingAlerts) && "loading"}
                    {alerts &&
                      alerts
                        .filter((alert) => alert.domain === videoMode)
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className="p-4 rounded-lg border border-destructive/30 bg-gradient-to-br from-destructive/10 via-background to-background shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 rounded-md overflow-hidden border border-border bg-secondary/40 flex-shrink-0">
                                <img
                                  src={alert.imageUrl}
                                  alt="Alert snapshot"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-secondary/40"
                                    >
                                      {videoMode}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        alert.createdAt,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px]"
                                  >
                                    Alert
                                  </Badge>
                                </div>
                                <p className="text-sm text-foreground font-semibold">
                                  Unknown{" "}
                                  {videoMode === "restriction"
                                    ? "person"
                                    : "car"}{" "}
                                  detected
                                </p>
                                <div className="flex items-center justify-between">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive/30 hover:bg-destructive/15 bg-transparent"
                                    onClick={() => setSelectedAlert(alert)}
                                  >
                                    <Camera className="size-4 mr-2" />
                                    View Photo
                                  </Button>
                                  <div className="flex items-center gap-1 text-xs text-chart-4">
                                    <Mail className="size-3" />
                                    Sent
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              )}
            </Card>

            {/* System status */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="size-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">
                  System Status
                </h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Restricted Door
                    </span>
                    {controlMode === "manual" ? (
                      <Unlock className="size-5 text-destructive" />
                    ) : (
                      <Lock className="size-5 text-chart-4" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={
                        controlMode === "manual"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-chart-4/10 text-chart-4 border-chart-4/20"
                      }
                    >
                      {controlMode === "manual" ? "Manual Override" : "Secured"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? "Connected" : "Awaiting connection"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <StatusRow
                    icon={isConnected ? Wifi : WifiOff}
                    label="Main Control Unit"
                    value={isConnected ? "online" : "offline"}
                    healthy={isConnected}
                  />
                  <StatusRow
                    icon={Battery}
                    label="Battery"
                    value="90%"
                    healthy
                  />
                  <StatusRow
                    icon={Lock}
                    label="Encryption"
                    value="active"
                    healthy
                  />
                </div>
              </div>
            </Card>

            <Dialog
              open={!!selectedAlert}
              onOpenChange={(open) => !open && setSelectedAlert(null)}
            >
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Intruder Snapshot</DialogTitle>
                </DialogHeader>
                {selectedAlert && (
                  <img
                    src={selectedAlert.imageUrl}
                    alt="Intruder snapshot"
                    className="w-full h-auto rounded-md"
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  healthy,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
      <div className="flex items-center gap-2">
        <Icon
          className={`size-4 ${healthy ? "text-chart-4" : "text-destructive"}`}
        />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Badge
        variant="outline"
        className={
          healthy
            ? "bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs"
            : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
        }
      >
        {value}
      </Badge>
    </div>
  );
}
