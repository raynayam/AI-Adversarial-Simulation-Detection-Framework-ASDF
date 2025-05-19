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

## System Architecture

Here's a diagram illustrating the main components and data flow:

```mermaid
graph TD
    A[Browser (User)] --> B(Frontend\n(React in Docker))
    B --> C(Backend\n(Flask in Docker))
    C --> D{Modules}
    D --> E[Attacks\nSimulation]
    D --> F[Detection\nLogic]
    D --> G[AI Adversary\n(Adapts Attacks)]
    F --> H[Logs / OSQuery\n(Data Source)]
    C --> I[Database\n(SQLite)]
    F --> I
    E --> I
    G --> E
    C --> A

    classDef default fill:#f9f,stroke:#333,stroke-width:2px;
    classDef docker fill:#ccf,stroke:#333,stroke-width:2px;
    classDef db fill:#cfc,stroke:#333,stroke-width:2px;

    class B,C docker;
    class I db;
```

**Explanation:**

*   The **Browser (User)** interacts with the **Frontend (React in Docker)**.
*   The **Frontend** communicates with the **Backend (Flask in Docker)** via API calls.
*   The **Backend** orchestrates the core logic, interacting with:
    *   **Attacks Simulation** modules (Red Team actions).
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
