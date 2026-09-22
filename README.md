# KineticHost (KineticFree)

> **Free Forever 24/7 Minecraft Server Hosting Platform & Control Panel**

A production-quality Minecraft hosting platform and control panel built with **Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui**. Features a high-tick landing page, complete authentication, user dashboard, Pterodactyl-style server management, and staff administration console.

---

## ⚡ 1-Click Automated Installer (Linux)

Deploy KineticHost on Ubuntu, Debian, CentOS, AlmaLinux, or Rocky Linux in seconds:

```bash
curl -sSL https://raw.githubusercontent.com/xAyan55/KineticFree/main/install.sh | sudo bash
```

Or run locally from the repository:

```bash
sudo bash install.sh
```

The automated installer will:
1. Detect your Linux distribution and architecture.
2. Install system dependencies and Node.js 20+ LTS.
3. Fetch dependencies and compile the production bundle.
4. Configure and enable `kinetichost.service` via systemd for 24/7 background operation.
5. Open firewall ports for the web panel, Minecraft (`25565`), and SFTP (`2022`).

---

## 🎮 Platform Features

### 1. Landing & Authentication
- **Cinematic Video Hero**: Ultra-high-definition Minecraft cinematic background with instant server creation CTA.
- **Glassmorphism Header**: Centered navigation with active server counter and direct link to dashboard.
- **Dynamic Community Reviews**: Continuous smooth marquee featuring server creator testimonials.
- **Modern Auth Experience (`auth-fuse`)**: Split-screen design with interactive typewriter quotes, password reveal, and 1-click test credentials.

### 2. User Control Panel
- **Telemetry Overview**: Real-time cluster RAM, dedicated CPU share, fast NVMe capacity, and uptime SLA.
- **Multi-Step Deployment Wizard**: Provision PaperMC, Purpur, Fabric, Vanilla, or Velocity with custom versions in under 5 seconds.
- **Live Minecraft Console**:
  - ANSI-color formatted terminal output.
  - Scroll lock and auto-scroll control.
  - Command input with history recall (Up/Down arrow keys).
  - Quick action shortcuts (`tps`, `list`, `save-all`).
  - Real-time CPU, RAM, Disk, and Network telemetry strip.
- **File Manager & Editor**: In-browser directory browser with breadcrumbs, upload support, and full-screen config editor with `Ctrl+S` saving.
- **MySQL Databases**: 1-click MariaDB/MySQL database provisioning with secure password reveal.
- **Snapshot Backups**: Automated and manual full-container snapshots with instant restoration.
- **Automated Schedules**: Cron-based reboot and broadcast task chaining.
- **Encrypted SFTP**: Direct SSH file transfer connection details.
- **Network & Allocations**: Auxiliary ports for SimpleVoiceChat, BlueMap, Dynmap, and Geyser/Bedrock.
- **Startup Parameters**: JVM launch arguments, target build selection, and Docker environment variables.

### 3. Account Settings
- **Profile Management**: Identity metadata and membership records.
- **Security**: Password rotation and active session revocation.
- **API Access Keys**: Generate REST API tokens with 1-time secret reveal.

### 4. Staff Administration Console
- **Root Operations Dashboard**: Global cluster health, memory pools, and recent audit activity.
- **Fleet Containers**: Real-time supervision and instant suspension across all user instances.
- **User Accounts**: Staff permissions, account suspension toggles, and user deletion.
- **Host Node Clusters**: Bare-metal hypervisors, daemon status, and over-allocation monitoring.
- **IP & Port Pools**: Allocate and map port ranges to host nodes.
- **Service Eggs**: Pterodactyl-compatible game software manifests and Docker images.
- **Global Audit Ledger**: Forensic logging of all administrative actions with IP tracking.
- **Platform Configuration**: Free-tier resource caps, public registration switches, and maintenance mode.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + Radix UI Primitives
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Manual Local Setup

### Prerequisites
- Node.js 20+ LTS
- npm or pnpm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/xAyan55/KineticFree.git
cd KineticFree

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Quick Demo Logins

For local testing, any email/password combination is accepted, with pre-configured mock roles:

| Role | Email | Password |
|---|---|---|
| **Platform Administrator** | `ayan@kinetic.host` | `password123` |
| **Standard User** | `user@kinetic.host` | `password123` |

*(Or click the **Admin** / **Regular User** quick buttons on the sign-in page)*

---

## 📄 License
MIT License
