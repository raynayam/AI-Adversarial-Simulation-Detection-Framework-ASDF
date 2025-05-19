# Adversarial Simulation & Detection Framework (ASDF)
A unique, modular cybersecurity project that simulates real-world attacks (Red Team) and provides automated detection, alerting, and reporting (Blue Team) — all in a modern, extensible framework.

## Features
- **Modular Attack Simulation Engine (Red Team):** Simulates phishing, lateral movement, privilege escalation, and data exfiltration attacks.
- **Automated Detection & Response (Blue Team):** Real-time log monitoring, detection rules, alerting, and forensics snapshotting.
- **Interactive Dashboard:** Visualizes attacks, detections, and system status (Flask + React).
- **Adversarial AI:** ML model adapts Red Team attack patterns based on Blue Team detection.
- **Dockerized:** Easy to run and demo.


## Quick Start
1. Clone the repo
2. `docker-compose up --build`
3. Access the dashboard at `http://localhost:3000`

## Extending
- Add new attacks in `attacks/`
- Add new detection rules in `detection/`

**Explanation:**

*   The **Browser (User)** interacts with the **Frontend (React in Docker)**.
*   The **Frontend** communicates with the **Backend (Flask in Docker)** via API calls.
*   The **Backend** orchestrates the core logic, interacting with:
    *   **Attacks Simulation** modules (Red Team actions).<img width="942" alt="Screenshot 2025-05-19 at 2 32 00 PM" src="https://github.com/user-attachments/assets/b30134f8-aaf1-4ec2-96c4-ded983a99f65" />
<img width="942" alt="Screenshot 2025-05-19 at 2 31 38 PM" src="https://github.com/user-attachments/assets/1167a09b-0e63-4e58-a4f5-ba76975771cc" />
<img width="942" alt="Screenshot 2025-05-19 at 2 31 28 PM" src="https://github.com/user-attachments/assets/de0a8849-6b19-4906-bb1b-e77de3813e0e" />

    *   **Detection Logic** modules (Blue Team analysis).
    *   The **AI Adversary** module (adapts attacks based on detection feedback).
    *   The **Database (SQLite)** for storing events (attacks, detections, responses) and user information.
*   The **Detection Logic** can utilize **Logs / OSQuery** as data sources to find evidence of simulated attacks.
*   The **AI Adversary** influences the **Attacks Simulation** based on detection outcomes.
*   The **Backend** also sends data (like timeline events and AI evasion level) back to the **Frontend** for visualization.

---


---
## License
MIT 
