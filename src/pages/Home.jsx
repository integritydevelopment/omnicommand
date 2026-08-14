import React from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentReports from "@/components/AgentReports";
import TodoDashboard from "@/components/TodoDashboard";
import AppLaunchpad from "@/components/AppLaunchpad";
import WatchdogStatus from "@/components/WatchdogStatus";
import DashboardGrid from "@/components/DashboardGrid";

export default function Home() {
  return (
    <div className="dark h-screen flex bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <DashboardGrid
          widgets={[
            { id: "reports", title: "Agent Reports", component: <AgentReports /> },
            { id: "todo", title: "To-Do Dashboard", component: <TodoDashboard /> },
            { id: "watchdogs", title: "Watchdogs", component: <WatchdogStatus /> },
            { id: "launchpad", title: "App Launchpad", component: <AppLaunchpad /> },
          ]}
        />
      </div>
    </div>
  );
}