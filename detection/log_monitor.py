# Log Monitoring Module

import time
try:
    import osquery
    OSQUERY_AVAILABLE = True
except ImportError:
    OSQUERY_AVAILABLE = False

class LogMonitor:
    def __init__(self, log_path=None):
        self.log_path = log_path
        if OSQUERY_AVAILABLE:
            self.client = osquery.ExtensionClient(path=None)
        else:
            self.client = None

    def monitor_processes(self):
        if OSQUERY_AVAILABLE and self.client:
            try:
                response = self.client.query('SELECT pid, name, path FROM processes LIMIT 5;')
                print("[Detection] Top 5 running processes:")
                for row in response['rows']:
                    print(row)
                return response['rows']
            except Exception as e:
                print(f"[Detection] osquery error: {e}")
                return []
        else:
            print("[Detection] osquery not available, falling back to log file parsing.")
            return self.parse_log_file()

    def parse_log_file(self):
        if not self.log_path:
            print("[Detection] No log file path provided.")
            return []
        try:
            with open(self.log_path, 'r') as f:
                lines = f.readlines()[-5:]
                print("[Detection] Last 5 log lines:")
                for line in lines:
                    print(line.strip())
                return lines
        except Exception as e:
            print(f"[Detection] Log file error: {e}")
            return []

    def monitor(self):
        print(f"[Detection] Monitoring logs at {self.log_path}")
        # Mock: Just print every 5 seconds
        while True:
            print("[Detection] Scanning logs...")
            time.sleep(5) 