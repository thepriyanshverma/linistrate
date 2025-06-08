import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Eye } from "lucide-react";

interface Execution {
  command_id: number;
  command: string;
  status: "success" | "failed";
  output: string;
  created_at: string;
  asset: string;
  assetIp: string;
  group: string;
  groupColor: string;
}

export default function ExecutionHistory() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      const token = localStorage.getItem("linistrate_token");
      const res = await fetch("http://localhost:8000/command/v1/executions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch execution history");
        return;
      }

      const data = await res.json();
      setExecutions(data);
    };

    fetchExecutions();
  }, []);
return (
  <>
    <div className="space-y-4 animate-fade-in w-full -mt-64">
      <div>
        <h1 className="text-3xl font-bold">Execution History</h1>
        <p className="text-muted-foreground">
          Monitor your last executed commands and scripts
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {executions.map((exec) => (
        <Card key={exec.command_id} className="shadow-lg rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{exec.command}</h2>
              <Badge
                className={`text-white ${
                  exec.status === "success"
                    ? "bg-green-500 hover:bg-green-500"
                    : "bg-red-500 hover:bg-red-500"
                }`}
              >
                {exec.status.toUpperCase()}
              </Badge>
            </div>

            <div className="text-sm text-gray-500">
              {new Date(exec.created_at).toLocaleString()}
            </div>

            <div className="text-sm font-medium">
              <span className="text-gray-600">Asset:</span>{" "}
              {exec.asset} ({exec.assetIp})
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: exec.groupColor }}
              />
              <span>{exec.group}</span>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  <Eye size={16} />
                  View Output
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-2">Command Output</h3>
                <Textarea
                  className="w-full h-96 font-mono text-sm"
                  readOnly
                  value={exec.output || exec.error || "No output"}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  </>
);
}