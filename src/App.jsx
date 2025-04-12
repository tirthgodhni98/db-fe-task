import React, { useState, useEffect } from "react";

const App = () => {
  const [backupType, setBackupType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [allBackups, setAllBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backupsPerPage = 5;

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://w8pkx428rp.us-east-1.awsapprunner.com/backups");

        if (!response.ok) {
          throw new Error(`Failed to fetch backups: ${response.statusText}`);
        }

        const data = await response.json();
        setAllBackups(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching backups:", err);
        setError("Failed to load backups. Please try again later.");
        setAllBackups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBackups();
  }, []);

  const filteredBackups =
    backupType === "All"
      ? allBackups
      : allBackups.filter((b) => b.type === backupType);

  const totalPages = Math.ceil(filteredBackups.length / backupsPerPage);
  const indexOfLast = currentPage * backupsPerPage;
  const indexOfFirst = indexOfLast - backupsPerPage;
  const currentBackups = filteredBackups.slice(indexOfFirst, indexOfLast);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`https://w8pkx428rp.us-east-1.awsapprunner.com/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ backupId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore backup");
      }
      const result = await response.text();
      alert("Inserted");
    } catch (error) {
      console.error("Error restoring backup:", error);
    }
  };

  const handleManualBackup = async () => {
    try {
      const response = await fetch("https://w8pkx428rp.us-east-1.awsapprunner.com/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "Manual" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create manual backup");
      }

      const data = await response.text();

      const backupsResponse = await fetch("https://w8pkx428rp.us-east-1.awsapprunner.com/backups");
      if (backupsResponse.ok) {
        const backupsData = await backupsResponse.json();
        setAllBackups(backupsData);
      }
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  };

  const buttonStyle = {
    padding: "10px 16px",
    marginRight: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontWeight: "500",
    transition: "background-color 0.3s",
  };

  const outlineButton = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "#4f46e5",
    border: "2px solid #4f46e5",
  };

  const tableHeaderStyle = {
    backgroundColor: "#1f2937",
    color: "#fff",
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ margin: 0 }}>Backup Manager</h2>
          <button style={buttonStyle} onClick={handleManualBackup}>
            + Manual Backup
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setBackupType("All")}
            style={backupType === "All" ? buttonStyle : outlineButton}
          >
            All
          </button>
          <button
            onClick={() => setBackupType("Automatic")}
            style={backupType === "Automatic" ? buttonStyle : outlineButton}
          >
            Automatic
          </button>
          <button
            onClick={() => setBackupType("Manual")}
            style={backupType === "Manual" ? buttonStyle : outlineButton}
          >
            Manual
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={tableHeaderStyle}>
              <th style={{ padding: "12px", textAlign: "left" }}>#</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Backup Filename
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Date & Time
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6b7280",
                  }}
                >
                  Loading backups...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#ef4444",
                  }}
                >
                  {error}
                </td>
              </tr>
            ) : (
              currentBackups.map((backup, idx) => (
                <tr
                  key={backup._id}
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <td style={{ padding: "12px" }}>
                    {(currentPage - 1) * backupsPerPage + idx + 1}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {backup.filename} / {backup.type}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {new Date(backup.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      style={{
                        ...buttonStyle,
                        backgroundColor: "#10b981",
                        padding: "8px 14px",
                        fontSize: "14px",
                      }}
                      onClick={() => handleRestore(backup._id)}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
            {currentBackups.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6b7280",
                  }}
                >
                  No backups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              style={{
                padding: "8px 12px",
                margin: "0 4px",
                borderRadius: "6px",
                backgroundColor: page === currentPage ? "#4f46e5" : "#e5e7eb",
                color: page === currentPage ? "#fff" : "#111827",
                border: "none",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
