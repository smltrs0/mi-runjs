# Mi RunJS

Playground de JavaScript de escritorio, portable y liviano. Usa **Tauri 2** (WebView nativo + Rust), **SvelteKit** y **CodeMirror 6**. No empaqueta Chromium: el binario ronda unos cuantos MB y corre en Windows, macOS y Linux.

El código se ejecuta en el motor JavaScript del WebView (`new Function`), no en Node/Deno/Bun. `console.log` y el valor de retorno se muestran en el panel derecho.

---

## Cómo funciona

1. Escribes JS en el editor (panel izquierdo).
2. **Ctrl+Enter** / **Cmd+Enter** o el botón **Run** ejecutan el script.
3. La consola (panel derecho) muestra logs, errores y el valor retornado.
4. **Auto-run** vuelve a ejecutar al dejar de teclear (~280 ms).
5. Temas Monokai Pro: Classic, Ristretto, Octagon, Spectrum, Machine (se guardan en `localStorage`).

Atajos: **🧹** limpia solo la consola. Arrastra el divisor para cambiar el ancho de los paneles.

---

## Requisitos en todos los sistemas

| Herramienta | Versión | Notas |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ (recomendado 20 o 22) | Incluye `npm` |
| [Rust](https://rustup.rs/) | estable (`rustup`) | `rustc` y `cargo` en el PATH |
| WebView del SO | nativo | Ver cada plataforma abajo |

Instalar Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

En Windows usa el instalador de [rustup](https://rustup.rs/) y luego **cierra y abre** la terminal. Comprueba:

```bash
node -v
npm -v
rustc -V
cargo -V
```

---

## Windows

1. **Node.js** LTS.
2. **Rust** (`x86_64-pc-windows-msvc`) y `%USERPROFILE%\.cargo\bin` en el PATH de usuario.
3. **Visual Studio Build Tools 2022** (o Visual Studio Community) con:
   - workload **Desktop development with C++**
   - **Windows 10/11 SDK**
4. **WebView2 Evergreen** (en Windows 11 suele venir instalado):  
   https://developer.microsoft.com/microsoft-edge/webview2/

No uses MinGW/`windows-gnu` para este proyecto: Tauri espera MSVC.

Si Build Tools está instalado pero no compila, abre *Visual Studio Installer* → **Modify** → marca **Desktop development with C++**.

---

## macOS

1. Xcode Command Line Tools:

```bash
xcode-select --install
```

2. Node y Rust (Homebrew opcional):

```bash
brew install node
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

3. En Apple Silicon el target por defecto es `aarch64-apple-darwin`. Para Intel: `x86_64-apple-darwin`.

El WebView es **WKWebView** (incluido en el sistema). No hace falta WebKit extra.

---

## Linux (por distro)

Tauri 2 necesita **WebKitGTK 4.1**, compilador C/C++, OpenSSL y librerías de sistema. Instala las dependencias **antes** de `npm run tauri dev`.

### Debian / Ubuntu / Linux Mint / Pop!_OS

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl wget file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

Ubuntu 22.04+ y Debian 12+ tienen `libwebkit2gtk-4.1-dev`. Si el paquete no existe, actualiza la distro; Tauri 2 no usa WebKit 4.0.

### Fedora / RHEL / Rocky / Alma

```bash
sudo dnf group install -y c-development
sudo dnf install -y \
  webkit2gtk4.1-devel \
  openssl-devel \
  curl wget file \
  libxdo-devel \
  librsvg2-devel
```

### Arch Linux / Manjaro / EndeavourOS

```bash
sudo pacman -Syu --needed \
  webkit2gtk-4.1 \
  base-devel \
  curl wget file \
  openssl \
  libxdo \
  appmenu-gtk-module \
  librsvg \
  patchelf
```

### openSUSE (Leap / Tumbleweed)

```bash
sudo zypper install -y \
  webkit2gtk3-devel \
  libopenssl-devel \
  curl wget file \
  libxdo-devel \
  gcc gcc-c++ make \
  librsvg-devel \
  patchelf
```

Si `webkit2gtk3-devel` no cubre 4.1, busca el paquete `webkit2gtk-4.1-devel` (nombre según la versión de Tumbleweed).

### Gentoo

```bash
sudo emerge --ask net-libs/webkit-gtk:4.1 dev-libs/openssl x11-libs/libxdo
```

Activa las USE flags de GTK que pida el ebuild.

### NixOS

Usa un `devShell` con `webkitgtk_4_1`, `pkg-config`, `openssl`, `libxdo` y `rustup`/`nodejs`. Ejemplo mínimo:

```nix
# fragmento para shell.nix / flake
buildInputs = [
  pkg-config openssl webkitgtk_4_1 libxdo
];
```

### AppImage en runtime (usuarios finales)

Quien **solo ejecute** el `.AppImage` no necesita Rust. Sí necesita WebKitGTK 4.1 en el sistema:

```bash
# Debian/Ubuntu
sudo apt install libwebkit2gtk-4.1-0

# Fedora
sudo dnf install webkit2gtk4.1

# Arch
sudo pacman -S webkit2gtk-4.1
```

---

## Compilar y ejecutar

En la raíz del repo:

```bash
npm install
```

### Desarrollo (hot reload)

```bash
npm run tauri dev
```

La primera vez baja crates de Rust y puede tardar varios minutos.

### Binario de producción

Hay que **compilar en cada sistema operativo** (no se cruza de Windows a Linux). En la máquina destino:

```bash
npm run tauri build
```

Artefactos en `src-tauri/target/release/bundle/`:

| SO | Salida típica |
|---|---|
| Windows | `.exe` (NSIS o MSI) en `nsis/` o `msi/` |
| macOS | `.dmg` y `.app` en `macos/` / `dmg/` |
| Linux | `.deb`, `.rpm` y/o `.AppImage` en `deb/`, `rpm/`, `appimage/` |

El ejecutable sin instalador también queda en `src-tauri/target/release/` (`mi-runjs.exe` o `mi-runjs`).

Para un solo formato, por ejemplo AppImage:

```bash
npx tauri build --bundles appimage
```

Otros: `deb`, `rpm`, `nsis`, `msi`, `dmg`.

---

## Uso diario

1. Abre la app (dev o el instalador).
2. Escribe JavaScript. Ejemplo:

```js
const usuario = { nombre: "Dev", rol: "Admin" };
console.log(usuario);
`Hola, ${usuario.nombre}`;
```

3. **Ctrl+Enter** (Windows/Linux) o **Cmd+Enter** (macOS).
4. Elige tema en la barra inferior. Activa o desactiva Auto-run.

Fuente recomendada (opcional, ligaduras `=>`): [Fira Code](https://github.com/tonsky/FiraCode) o JetBrains Mono.

---

## Problemas frecuentes

| Síntoma | Qué hacer |
|---|---|
| `rustc` / `cargo` no se reconoce | Añade `~/.cargo/bin` (o `%USERPROFILE%\.cargo\bin`) al PATH y abre otra terminal |
| Windows: `link.exe` not found | Instala el workload **Desktop development with C++** |
| Linux: no encuentra `webkit2gtk-4.1` | Instala el `-dev`/`-devel` de tu distro (tabla de arriba) |
| Linux: la ventana no abre / WebKit | Instala el runtime `libwebkit2gtk-4.1-0` (o equivalente) |
| Windows: error de WebView | Instala WebView2 Evergreen |
| `npm run tauri dev` no arranca el frontend | Puerto **1420** libre; Node 18+ |
| Objetos se ven bien, `require()` / `fs` fallan | Es el JS del WebView, no Node. Aún no hay backend Node/Bun |

---

## Stack

- Escritorio: Tauri 2 (`com.mirunjs.app`)
- UI: Vite + SvelteKit (SPA, `ssr = false`)
- Editor: CodeMirror 6 + `@codemirror/lang-javascript` + autocompletado
- Temas: paletas Monokai Pro propias (`src/lib/themes.ts`)
- Ejecución: `src/lib/run.ts` sobre el WebView
