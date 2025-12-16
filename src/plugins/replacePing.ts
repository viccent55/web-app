import fs from "fs";
import path from "path";

export function replacePingPlugin() {
  return {
    name: "replace-ping-txt",
    closeBundle() {
      const distDir = path.resolve(__dirname, "../../dist");
      const pingFile = path.join(distDir, "ping.txt");

      const content = `xhsapp
buildTime=${new Date().toISOString()}
`;

      try {
        fs.writeFileSync(pingFile, content, "utf-8");
        console.log("✅ ping.txt replaced successfully");
      } catch (err) {
        console.error("❌ Failed to replace ping.txt", err);
      }
    },
  };
}
