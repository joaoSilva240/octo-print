<div align="center">
  <img src="icon128.png" alt="Boituva Print Bot" width="64">
</div>

# Boituva Print Bot

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

Extensão Chrome leve para automação de capturas de tela de portais em horários agendados.

## Descrição

O **Boituva Print Bot** é uma extensão Chrome (Manifest V3) que automatiza o processo de captura de tela de um portal web específico em horários predefinidos. A extensão abre o portal, aguarda o carregamento do conteúdo, captura a tela e salva a imagem automaticamente na pasta de downloads do navegador.

### Funcionalidades

- Captura automática de tela em horários agendados
- Notificação de aviso 10 segundos antes de cada captura
- Nomes de arquivo com timestamp automático
- Execução em background via Service Worker

## Instalação

### Pré-requisitos

- Google Chrome (versão moderna)
- Acesso ao portal alvo

### Passos

1. **Clone o repositório** ou baixe os arquivos do projeto

2. **Abra o Chrome** e navegue para `chrome://extensions/`

3. **Ative o modo desenvolvedor** (botão no canto superior direito)

4. **Clique em "Carregar sem compactação"** (Load unpacked)

5. **Selecione a pasta do projeto** (onde está o `manifest.json`)

6. A extensão aparecerá na lista como "Boituva Print Bot"

## Uso

A extensão opera automaticamente após instalada. Os horários de captura são:

| Horário | Descrição |
|---------|-----------|
| 08:20   | Captura matinal |
| 12:00   | Captura do meio-dia |
| 16:45   | Captura da tarde |

### Fluxo de Operação

1. **10 segundos antes** da captura: notificação de aviso
2. **No horário agendado**: 
   - Abre o portal automaticamente
   - Aguarda 10 segundos para renderização
   - Captura a tela
   - Salva o arquivo PNG
   - Fecha a aba

### Arquivos Gerados

Os arquivos são salvos no formato:
```
boituva_YYYY-MM-DD_HH-MM-SS.png
```
Exemplo: `boituva_2024-03-18_08-20-00.png`

## Arquitetura

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐      ┌──────────────────────┐         │
│  │   manifest.json │      │    background.js     │         │
│  │   (Config)      │      │    (Service Worker)  │         │
│  └─────────────────┘      └──────────┬───────────┘         │
│                                      │                      │
│                    ┌─────────────────┼─────────────────┐   │
│                    ▼                 ▼                 ▼   │
│           ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│           │  Alarms API │  │  Tabs API   │  │Downloads API││
│           │ (Agendador) │  │ (Navegação) │  │   (Salvamento)│
│           └─────────────┘  └─────────────┘  └─────────────┘│
│                    │                 │                 │    │
│                    └─────────────────┼─────────────────┘   │
│                                      ▼                       │
│                           ┌──────────────────────┐         │
│                           │   Capture Workflow    │         │
│                           │  ┌────────────────┐  │         │
│                           │  │ 1. Create Tab  │  │         │
│                           │  │ 2. Wait 10s    │  │         │
│                           │  │ 3. Capture PNG  │  │         │
│                           │  │ 4. Save File    │  │         │
│                           │  │ 5. Close Tab    │  │         │
│                           │  └────────────────┘  │         │
│                           └──────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Schedule  │───▶│  Alarm   │───▶│ Capture  │───▶│ Download │
│ (Horário) │    │ (Chrome) │    │ (Tab)    │    │  (PNG)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Estrutura de Arquivos

```
boituva-print-bot/
│
├── manifest.json       # Configuração da extensão (Manifest V3)
│                      # - Define permissões (alarms, tabs, downloads, notifications)
│                      # - Registra o service worker
│
├── background.js       # Service Worker (lógica principal)
│                      # - SCHEDULES: array de horários agendados
│                      # - createDailyAlarms(): configura alarmes diários
│                      # - capturePortal(): captura a tela do portal
│                      # - notify(): envia notificações ao usuário
│                      # - buildFilename(): gera nome do arquivo com timestamp
│                      # - wait(): utilitário de delay
│
├── icon128.png         # Ícone da extensão (128x128 pixels)
│
├── AGENTS.md          # Guia para contribuidores e agentes de IA
│
└── README.md          # Este arquivo
```

### APIs Chrome Utilizadas

| API | Uso |
|-----|-----|
| `chrome.alarms` | Agendamento de capturas em horários específicos |
| `chrome.tabs` | Criação e gerenciamento de abas do portal |
| `chrome.tabs.captureVisibleTab` | Captura de screenshot da aba visível |
| `chrome.downloads` | Salvamento automático do arquivo PNG |
| `chrome.notifications` | Alertas e avisos para o usuário |

## Configuração

### Alterar Horários de Captura

Edite o array `SCHEDULES` em `background.js`:

```javascript
const SCHEDULES = [
  { warnName: "warn_0820", runName: "run_0820", hour: 8, minute: 20 },
  { warnName: "warn_1200", runName: "run_1200", hour: 12, minute: 0 },
  { warnName: "warn_1700", runName: "run_1700", hour: 16, minute: 45 }
];
```

### Alterar URL do Portal

Modifique a constante `TARGET_URL` em `background.js`:

```javascript
const TARGET_URL = "https://seu-portal.com/";
```

### Alterar Tempo de Espera

Ajuste o valor em `background.js:83`:

```javascript
await wait(10000); // 10 segundos (10000ms)
```

## Depuração

1. Acesse `chrome://extensions/`
2. Localize "Boituva Print Bot"
3. Clique em "service_worker" para abrir o DevTools
4. Veja os logs no console

### Teste Manual

No console do DevTools do service worker, execute:

```javascript
capturePortal();      // Captura imediata
createDailyAlarms();  // Reconfigura alarmes
```

## Licença

MIT License