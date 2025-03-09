import { useState, useEffect } from "react";
import {
  ShieldHalf,
  FolderPlus,
  CheckCircle,
  Folder,
  PenSquare,
  Save,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

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
    timestamp?: Date;
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
      setBackupStatus({
        type: "success",
        message: result.message,
        timestamp: new Date(),
      });
    } else {
      setBackupStatus({ type: "error", message: result.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <div className="flex items-center justify-center mb-6">
          <ShieldHalf className="text-yellow-500 h-10 w-10 mr-3" />
          <h1 className="text-3xl font-bold">Elden Ring Save Backup</h1>
        </div>
        <p className="text-gray-400">
          Safely backup your Elden Ring save files
        </p>
      </div>

      <Card className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <CardContent className="p-0">
          {!backupLocation ? (
            <div className="text-center py-12">
              <div className="mb-8">
                <Folder className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-3 text-white">
                  No backup location selected
                </h2>
                <p className="text-gray-400 mb-6">
                  Choose a location to store your save file backups
                </p>
              </div>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg flex items-center mx-auto"
                onClick={handleSelectLocation}
              >
                <FolderPlus className="mr-2 h-5 w-5" />
                Choose Backup Location
              </Button>
            </div>
          ) : (
            <div>
              {backupStatus.type === "success" && (
                <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                    <span className="text-green-500">
                      {backupStatus.message}
                    </span>
                  </div>
                  {backupStatus.timestamp && (
                    <p className="text-gray-400 text-sm">
                      Last Backup:{" "}
                      {format(backupStatus.timestamp, "MMMM d, yyyy HH:mm")}
                    </p>
                  )}
                </div>
              )}

              {backupStatus.type === "error" && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-red-500 h-5 w-5 mr-2" />
                    <span className="text-red-500">Backup failed</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {backupStatus.message}
                  </p>
                </div>
              )}

              <div className="mb-8 p-4 bg-gray-700/50 rounded-lg">
                <label className="text-sm text-gray-400 mb-2 block">
                  Current Backup Location
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Folder className="text-yellow-500 h-5 w-5 mr-2" />
                    <span className="text-gray-200">{backupLocation}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={handleSelectLocation}
                    aria-label="Change backup location"
                    tabIndex={0}
                  >
                    <PenSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center"
                  onClick={handleBackup}
                  disabled={isBackingUp}
                >
                  {isBackingUp ? (
                    <>
                      <Save className="mr-2 h-5 w-5 animate-spin" />
                      Backing up...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Backup Now
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center"
                  onClick={handleSelectLocation}
                >
                  <FolderTree className="mr-2 h-5 w-5" />
                  Change Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="max-w-2xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>
          Version 0.0.1 •
          <span className="hover:text-gray-400 cursor-pointer ml-1">
            Documentation
          </span>{" "}
          •
          <span className="hover:text-gray-400 cursor-pointer ml-1">
            Support
          </span>
        </p>
      </div>
    </div>
  );
}
