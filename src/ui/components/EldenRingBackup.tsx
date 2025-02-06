import { useState, useEffect } from "react";

interface ElectronAPI {
  selectBackupLocation: () => Promise<string | null>;
  getBackupLocation: () => Promise<string | null>;
  backupSave: () => Promise<{ success: boolean; message: string }>;
}

// Access the API through the window object
const electronAPI = (window as any).electronAPI as ElectronAPI;

function EldenRingBackup() {
  const [backupLocation, setBackupLocation] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string>("");

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
    setBackupStatus("Backing up...");
    const result = await electronAPI.backupSave();
    if (result.success) {
      setBackupStatus(result.message);
    } else {
      setBackupStatus(`Error: ${result.message}`);
    }
  };

  return (
    <div>
      <h1>Elden Ring Save Backup</h1>
      <button onClick={handleSelectLocation}>Choose Backup Location</button>
      <p>Backup Location: {backupLocation || "Not selected"}</p>
      <button onClick={handleBackup}>Backup Now</button>
      <p>{backupStatus}</p>
    </div>
  );
}

export default EldenRingBackup;
