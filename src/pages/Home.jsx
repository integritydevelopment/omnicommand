import React from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentReports from "@/components/AgentReports";
import TodoDashboard from "@/components/TodoDashboard";
import AppLaunchpad from "@/components/AppLaunchpad";

export default function Home() {
  return (
    <div className="dark h-screen flex bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 lg:h-[calc(100vh-8rem)]">
            <div className="lg:col-span-2 min-h-[400px] lg:min-h-0">
              <AgentReports />
            </div>
            <div className="min-h-[300px] lg:min-h-0">
              <TodoDashboard />
            </div>
          </div>
          <AppLaunchpad />
        </main>
      </div>
    </div>
  );
}