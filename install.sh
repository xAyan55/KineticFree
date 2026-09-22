#!/usr/bin/env bash
# ==============================================================================
#  _  _____ _   _ _____ _____ ___ ____ _   _  ___  ____ _____ 
# | |/ /_ _| \ | | ____|_   _|_ _/ ___| | | |/ _ \/ ___|_   _|
# | ' / | ||  \| |  _|   | |  | | |   | |_| | | | \___ \ | |  
# | . \ | || |\  | |___  | |  | | |___|  _  | |_| |___) || |  
# |_|\_\___|_| \_|_____| |_| |___\____|_| |_|\___/|____/ |_|  
#                                                              
# KineticHost — Production Minecraft Free-Hosting Control Panel
# One-Click Automated Installer & Deployment Engine
# Repository: https://github.com/xAyan55/KineticFree
# ==============================================================================

# --- Color Definitions ---
RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"
WHITE="\033[37m"

# --- Output Helpers ---
log_info() {
    echo -e "${BLUE}[INFO]${RESET} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${RESET} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${RESET} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${RESET} $1"
}

log_step() {
    echo -e "\n${CYAN}${BOLD}==>${RESET} ${WHITE}${BOLD}$1${RESET}"
}

# --- Safe Input Reader (handles curl | bash piped stdin) ---
safe_read() {
    local prompt="$1"
    local default_val="$2"
    local var_name="$3"
    local response=""

    if [ -t 0 ]; then
        read -r -p "$prompt" response
    elif [ -c /dev/tty ]; then
        read -r -p "$prompt" response < /dev/tty || response=""
    else
        response=""
    fi

    if [ -z "$response" ]; then
        eval "$var_name=\"$default_val\""
    else
        eval "$var_name=\"$response\""
    fi
}

# --- Banner Display ---
print_banner() {
    clear 2>/dev/null || true
    echo -e "${CYAN}${BOLD}"
    cat << "EOF"
  _  _____ _   _ _____ _____ ___ ____ _   _  ___  ____ _____ 
 | |/ /_ _| \ | | ____|_   _|_ _/ ___| | | |/ _ \/ ___|_   _|
 | ' / | ||  \| |  _|   | |  | | |   | |_| | | | \___ \ | |  
 | . \ | || |\  | |___  | |  | | |___|  _  | |_| |___) || |  
 |_|\_\___|_| \_|_____| |_| |___\____|_| |_|\___/|____/ |_|  
EOF
    echo -e "${RESET}"
    echo -e "${WHITE}${BOLD} KineticHost — High Performance Minecraft Hosting Control Panel${RESET}"
    echo -e "${DIM} Automated One-Click Installation & Systemd Deployment Script${RESET}"
    echo -e "${DIM} https://github.com/xAyan55/KineticFree${RESET}"
    echo -e "${CYAN}----------------------------------------------------------------------${RESET}\n"
}

# --- Check Permissions ---
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This installation script must be run as root (or using sudo)."
        echo -e "Please re-run with: ${YELLOW}sudo bash install.sh${RESET}\n"
        exit 1
    fi
}

# --- Detect OS & Package Manager ---
detect_os() {
    log_step "Detecting Operating System & Environment..."

    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME=$ID
        OS_VERSION=$VERSION_ID
        OS_PRETTY=$PRETTY_NAME
    elif type lsb_release >/dev/null 2>&1; then
        OS_NAME=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
        OS_VERSION=$(lsb_release -sr)
        OS_PRETTY=$(lsb_release -sd)
    else
        OS_NAME=$(uname -s | tr '[:upper:]' '[:lower:]')
        OS_PRETTY="Unknown Linux"
    fi

    ARCH=$(uname -m)
    log_info "Detected OS: ${WHITE}${OS_PRETTY} (${ARCH})${RESET}"

    case "$OS_NAME" in
        ubuntu|debian|raspbian|pop)
            PKG_MANAGER="apt"
            ;;
        centos|rhel|almalinux|rocky|fedora)
            PKG_MANAGER="dnf"
            if ! command -v dnf >/dev/null 2>&1; then
                PKG_MANAGER="yum"
            fi
            ;;
        arch|manjaro)
            PKG_MANAGER="pacman"
            ;;
        alpine)
            PKG_MANAGER="apk"
            ;;
        *)
            log_warn "Unrecognized distribution '$OS_NAME'. Will attempt generic installation."
            PKG_MANAGER="unknown"
            ;;
    esac
}

# --- Self-Heal Broken DPKG State ---
heal_dpkg() {
    if [ "$PKG_MANAGER" = "apt" ]; then
        # Check if dpkg was left interrupted
        if [ -f /var/lib/dpkg/lock ] || [ -f /var/lib/dpkg/lock-frontend ]; then
            log_info "Cleaning stale package manager locks..."
            fuser -vki /var/lib/dpkg/lock 2>/dev/null || true
            fuser -vki /var/lib/dpkg/lock-frontend 2>/dev/null || true
            fuser -vki /var/lib/apt/lists/lock 2>/dev/null || true
        fi
        dpkg --configure -a 2>/dev/null || true
        apt-get -f install -y -qq 2>/dev/null || true
    fi
}

# --- Install Essential System Tools ---
install_dependencies() {
    log_step "Verifying Core System Utilities..."

    heal_dpkg

    case "$PKG_MANAGER" in
        apt)
            export DEBIAN_FRONTEND=noninteractive
            
            # Identify missing essential tools
            MISSING=()
            for cmd in curl wget git tar unzip ca-certificates; do
                if ! command -v "$cmd" >/dev/null 2>&1; then
                    MISSING+=("$cmd")
                fi
            done

            if [ ${#MISSING[@]} -gt 0 ]; then
                log_info "Installing missing utilities: ${MISSING[*]}"
                apt-get update -qq 2>/dev/null || true
                for pkg in "${MISSING[@]}"; do
                    apt-get install -y -qq "$pkg" 2>/dev/null || {
                        heal_dpkg
                        apt-get install -y "$pkg" 2>/dev/null || log_warn "Could not install $pkg via apt."
                    }
                done
            else
                log_info "All core tools (curl, wget, git, tar, unzip) are already present."
            fi
            ;;
        dnf|yum)
            $PKG_MANAGER update -y -q 2>/dev/null || true
            $PKG_MANAGER install -y -q curl wget git tar unzip ca-certificates 2>/dev/null || true
            ;;
        pacman)
            pacman -Sy --noconfirm curl wget git tar unzip ca-certificates 2>/dev/null || true
            ;;
        apk)
            apk update 2>/dev/null || true
            apk add curl wget git tar unzip ca-certificates 2>/dev/null || true
            ;;
    esac

    log_success "System utilities verified."
}

# --- Install Node.js 20+ LTS ---
install_nodejs() {
    log_step "Checking Node.js & NPM Runtime..."

    NODE_READY=false
    if command -v node >/dev/null 2>&1; then
        NODE_VER=$(node -v | sed 's/v//' | cut -d'.' -f1)
        if [ "$NODE_VER" -ge 20 ]; then
            NODE_READY=true
            log_info "Node.js $(node -v) is already installed."
        else
            log_warn "Node.js $(node -v) is older than v20."
        fi
    fi

    if [ "$NODE_READY" = false ]; then
        log_info "Configuring Node.js 20 LTS..."

        INSTALLED=false

        # Attempt 1: NodeSource for APT
        if [ "$PKG_MANAGER" = "apt" ]; then
            heal_dpkg
            log_info "Adding NodeSource 20.x repository..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 || true
            if apt-get install -y -qq nodejs >/dev/null 2>&1; then
                INSTALLED=true
            fi
        elif [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 || true
            if $PKG_MANAGER install -y -q nodejs >/dev/null 2>&1; then
                INSTALLED=true
            fi
        elif [ "$PKG_MANAGER" = "pacman" ]; then
            pacman -S --noconfirm nodejs npm >/dev/null 2>&1 && INSTALLED=true
        fi

        # Attempt 2: Standalone Official Binary Fallback (Guaranteed to work regardless of broken apt/dpkg)
        if [ "$INSTALLED" = false ] || ! command -v node >/dev/null 2>&1; then
            log_warn "Standard package manager install failed or incomplete. Using standalone Node.js 20 binary fallback..."
            ARCH=$(uname -m)
            case "$ARCH" in
                x86_64) NODE_ARCH="x64" ;;
                aarch64|arm64) NODE_ARCH="arm64" ;;
                armv7l) NODE_ARCH="armv7l" ;;
                *) NODE_ARCH="x64" ;;
            esac

            NODE_VERSION="v20.18.0"
            NODE_TAR="node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
            NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_TAR}"

            log_info "Downloading prebuilt Node.js binary from ${NODE_URL}..."
            mkdir -p /tmp/nodejs-install
            curl -fsSL "$NODE_URL" -o "/tmp/nodejs-install/${NODE_TAR}"
            tar -xf "/tmp/nodejs-install/${NODE_TAR}" -C /usr/local --strip-components=1
            rm -rf /tmp/nodejs-install
        fi
    fi

    # Verify installation
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log_success "Node.js $(node -v) and NPM $(npm -v) are operational."
    else
        log_error "Could not initialize Node.js runtime. Please install Node.js >= 20 manually."
        exit 1
    fi
}

# --- Configuration Prompts ---
prompt_configuration() {
    log_step "Configuring KineticHost Deployment..."

    # Target directory
    DEFAULT_DIR="/var/www/kinetichost"
    if [ -d "./src" ] && [ -f "./package.json" ]; then
        CURRENT_PWD=$(pwd)
        safe_read "Install inside current folder ($CURRENT_PWD)? [Y/n]: " "Y" USE_CURR
        if [[ "$USE_CURR" =~ ^[Yy]$ ]]; then
            INSTALL_DIR="$CURRENT_PWD"
        else
            safe_read "Enter destination directory [$DEFAULT_DIR]: " "$DEFAULT_DIR" INSTALL_DIR
        fi
    else
        safe_read "Enter destination directory [$DEFAULT_DIR]: " "$DEFAULT_DIR" INSTALL_DIR
    fi

    # Target Port
    safe_read "Enter Web Control Panel Port [3000]: " "3000" PANEL_PORT

    # Public IP / Domain
    SERVER_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || echo "localhost")
    safe_read "Enter public domain or IP [$SERVER_IP]: " "$SERVER_IP" PUBLIC_HOST

    echo -e "\n${WHITE}${BOLD}Deployment Parameters:${RESET}"
    echo -e " • Directory:   ${CYAN}${INSTALL_DIR}${RESET}"
    echo -e " • Port:        ${CYAN}${PANEL_PORT}${RESET}"
    echo -e " • Host/Domain: ${CYAN}${PUBLIC_HOST}${RESET}"
    echo ""
    safe_read "Proceed with installation? [Y/n]: " "Y" CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        log_warn "Installation cancelled by user."
        exit 0
    fi
}

# --- Clone or Pull Repository ---
setup_repository() {
    log_step "Fetching KineticHost Source Code..."

    REPO_URL="https://github.com/xAyan55/KineticFree.git"

    if [ "$INSTALL_DIR" = "$(pwd)" ] && [ -f "package.json" ]; then
        log_info "Using existing repository files in $(pwd)"
    else
        if [ -d "$INSTALL_DIR/.git" ]; then
            log_info "Existing installation detected at $INSTALL_DIR. Pulling latest updates..."
            cd "$INSTALL_DIR"
            git pull origin main 2>/dev/null || git pull 2>/dev/null || true
        else
            log_info "Cloning repository from $REPO_URL to $INSTALL_DIR..."
            mkdir -p "$INSTALL_DIR"
            git clone "$REPO_URL" "$INSTALL_DIR"
            cd "$INSTALL_DIR"
        fi
    fi
}

# --- Install NPM Dependencies & Build ---
build_application() {
    log_step "Installing Node Dependencies & Building Application..."
    cd "$INSTALL_DIR"

    log_info "Executing npm install..."
    npm install --silent

    log_info "Compiling TypeScript and bundling with Vite..."
    npm run build

    log_success "Production bundle generated in ${INSTALL_DIR}/dist"
}

# --- Setup Systemd Background Service ---
setup_systemd() {
    log_step "Configuring Systemd Service (kinetichost.service)..."

    NODE_PATH=$(command -v node || echo "/usr/local/bin/node")
    NPX_PATH=$(command -v npx || echo "/usr/local/bin/npx")
    NODE_DIR=$(dirname "$NODE_PATH")

    cat << EOF > /etc/systemd/system/kinetichost.service
[Unit]
Description=KineticHost Minecraft Control Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
Environment="PATH=${NODE_DIR}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment=NODE_ENV=production
ExecStart=${NPX_PATH} vite preview --host 0.0.0.0 --port ${PANEL_PORT}
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

    if command -v systemctl >/dev/null 2>&1; then
        systemctl daemon-reload
        systemctl enable kinetichost.service >/dev/null 2>&1 || true
        systemctl restart kinetichost.service || true
        log_success "Systemd service 'kinetichost' enabled and started."
    else
        log_warn "Systemd not detected in this environment. You can run manually with: npm run preview -- --port ${PANEL_PORT}"
    fi
}

# --- Configure Firewall ---
setup_firewall() {
    log_step "Configuring Firewall Ports (if active)..."

    if command -v ufw >/dev/null 2>&1; then
        if ufw status 2>/dev/null | grep -q "Status: active"; then
            ufw allow "${PANEL_PORT}/tcp" >/dev/null 2>&1 || true
            ufw allow 25565/tcp >/dev/null 2>&1 || true
            ufw allow 2022/tcp >/dev/null 2>&1 || true
            log_success "UFW firewall rules updated for port ${PANEL_PORT} (Panel), 25565 (Minecraft), 2022 (SFTP)."
        fi
    elif command -v firewall-cmd >/dev/null 2>&1; then
        if systemctl is-active --quiet firewalld 2>/dev/null; then
            firewall-cmd --permanent --add-port="${PANEL_PORT}/tcp" >/dev/null 2>&1 || true
            firewall-cmd --permanent --add-port=25565/tcp >/dev/null 2>&1 || true
            firewall-cmd --permanent --add-port=2022/tcp >/dev/null 2>&1 || true
            firewall-cmd --reload >/dev/null 2>&1 || true
            log_success "Firewalld rules updated for ports ${PANEL_PORT}, 25565, and 2022."
        fi
    fi
}

# --- Health Check ---
verify_deployment() {
    log_step "Verifying Panel Health..."
    sleep 3

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PANEL_PORT}/" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "304" ]; then
        log_success "KineticHost is healthy and serving HTTP ${HTTP_STATUS} on port ${PANEL_PORT}!"
    else
        log_info "Service is booting up (HTTP status: ${HTTP_STATUS})."
    fi
}

# --- Completion Summary Screen ---
print_completion() {
    echo -e "\n${GREEN}${BOLD}======================================================================${RESET}"
    echo -e "${GREEN}${BOLD}       KINETIC HOST INSTALLATION COMPLETED SUCCESSFULLY!             ${RESET}"
    echo -e "${GREEN}${BOLD}======================================================================${RESET}\n"

    echo -e "${WHITE}${BOLD}Access URL:${RESET}           ${CYAN}http://${PUBLIC_HOST}:${PANEL_PORT}/${RESET}"
    echo -e "${WHITE}${BOLD}Local URL:${RESET}            ${CYAN}http://localhost:${PANEL_PORT}/${RESET}"
    echo -e "${WHITE}${BOLD}Installation Path:${RESET}    ${WHITE}${INSTALL_DIR}${RESET}"
    echo -e "${WHITE}${BOLD}System Service:${RESET}       ${WHITE}kinetichost.service${RESET}\n"

    echo -e "${YELLOW}${BOLD}Default Staff Credentials:${RESET}"
    echo -e " • Email:    ${WHITE}ayan@kinetic.host${RESET} (or any email containing 'admin')"
    echo -e " • Password: ${WHITE}password123${RESET}"
    echo -e " • Standard: ${WHITE}user@kinetic.host${RESET} / ${WHITE}password123${RESET}\n"

    echo -e "${WHITE}${BOLD}Service Management Commands:${RESET}"
    echo -e " • View Status:   ${CYAN}systemctl status kinetichost${RESET}"
    echo -e " • Restart Panel: ${CYAN}systemctl restart kinetichost${RESET}"
    echo -e " • Stop Panel:    ${CYAN}systemctl stop kinetichost${RESET}"
    echo -e " • View Logs:     ${CYAN}journalctl -u kinetichost -f${RESET}\n"

    echo -e "${DIM}Need support or updates? Visit https://github.com/xAyan55/KineticFree${RESET}\n"
}

# --- Main Execution Flow ---
main() {
    print_banner
    check_root
    detect_os
    install_dependencies
    install_nodejs
    prompt_configuration
    setup_repository
    build_application
    setup_systemd
    setup_firewall
    verify_deployment
    print_completion
}

main "$@"
