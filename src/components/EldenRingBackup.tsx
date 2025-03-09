import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ElectronAPI {
  selectBackupLocation: () => Promise<string | null>;
  getBackupLocation: () => Promise<string | null>;
  backupSave: () => Promise<{ success: boolean; message: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const electronAPI = window.electronAPI;

export default function EldenRingBackup() {
  const [backupLocation, setBackupLocation] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });
  const [isBackingUp, setIsBackingUp] = useState(false);

  useEffect(() => {
    async function getBackupLocation() {
      const location = await electronAPI.getBackupLocation();
      setBackupLocation(location);
    }

    getBackupLocation();
  }, []);

  const handleSelectLocation = async () => {
    const location = await electronAPI.selectBackupLocation();
    if (location) {
      setBackupLocation(location);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus({ type: "idle", message: "Backing up..." });
    const result = await electronAPI.backupSave();
    setIsBackingUp(false);
    if (result.success) {
      setBackupStatus({ type: "success", message: result.message });
    } else {
      setBackupStatus({ type: "error", message: result.message });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Elden Ring Save Backup
          </CardTitle>
          <CardDescription>
            Safely backup your Elden Ring save files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="backup-location"
              className="text-sm font-medium text-gray-700"
            >
              Backup Location
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="backup-location"
                type="text"
                readOnly
                value={backupLocation || "Not selected"}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                onClick={handleSelectLocation}
                variant="outline"
                size="icon"
              >
                <Folder className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {backupStatus.type !== "idle" && (
            <Alert
              variant={
                backupStatus.type === "error" ? "destructive" : "default"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {backupStatus.type === "error" ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{backupStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleBackup}
            disabled={!backupLocation || isBackingUp}
            className="w-full"
          >
            {isBackingUp ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Backing up...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Backup Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
