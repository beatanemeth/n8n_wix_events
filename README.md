# From Manual Chaos to Modular Automation: Building a Scalable n8n Workflow for a Foundation 🚀

This repository **showcases the evolution of an n8n workflow** designed to transform a nonprofit's manual, Excel-based operations into a streamlined, automated system. It provides the microservices and Wix Velo backend code discussed in a three-part article series published on Medium.

## 📚 Series Overview

This project chronicles a journey through different stages of automation, each building upon the last to achieve greater efficiency and control.

### Part 1: The Foundation – Simple Workflow for Core Processing

I began by experimenting with n8n to automate a few key tasks in the nonprofit’s manual Excel-based system. The goal was to eliminate repetitive data handling and basic follow-ups for paid event registrations — all within the limitations of the Wix Light plan.

### Part 2: Enhancing Automation – Scaling and External Triggers

The n8n workflow was extended to handle more logic branches and conditions, significantly reducing the number of manual updates in the Excel table. Participant tracking and email communication were largely automated.

### Part 3: Mastery and Optimization – Advanced Workflow Design & Strategic Refinement

Where Wix Automations originally handled the form data transfer to Google Sheets, this part introduces a custom Python script to fetch data directly from the Wix backend. This reduced the number of required Wix Automations and gave us more control and flexibility.

## 📂 Repo Overview

```bash
.
├── events-v2                   # 📂 Code specific to Part 2's enhancements
│   ├── assets
│   │   ├── wix-automation-run-velo-code-v1.png
│   │   ├── wix-automation-run-velo-code-v2.png
│   │   ├── wix-automation-send-http-request-configuration.png
│   │   └── wix-automation-send-http-request.png
│   └── wixVeloCode             # Wix Velo backend code for Part 2
│       ├── README.md           # Documentation for Wix Velo code (Part 2)
│       ├── wixAutomationCase1a
│       │   ├── runVeloCodeAutomationAction.js
│       │   └── runVeloCodeBackend.web.js
│       ├── wixAutomationCase1b
│       │   ├── runVeloCodeAutomationAction.js
│       │   └── runVeloCodeBackend.web.js
│       └── wixAutomationCase2
│           └── post_findRsvpContactById.js
├── events-v3                   # 📂 Code specific to Part 3's advanced features
│   ├── jwt_microservice        # FastAPI service for JWT generation
│   │   ├── app
│   │   │   ├── jwt_utils.py
│   │   │   └── main.py
│   │   ├── Dockerfile
│   │   ├── README.md           # Documentation for JWT microservice
│   │   └── requirements.txt
│   └── wixVeloCode             # Wix Velo backend code for Part 3
│       ├── eventGuestService.web.js
│       ├── eventGuests.js
│       ├── http-functions.js
│       ├── README.md           # Documentation for Wix Velo code (Part 3)
│       └── util.web.js
├── README.md                   # This overview file
└── stripe_microservice         # 💳 FastAPI service for Stripe data fetching
    ├── app
    │   ├── main.py
    │   └── stripe_fetcher.py
    ├── Dockerfile
    ├── README.md               # Documentation for Stripe microservice
    └── requirements.txt

```

- `stripe_microservice`: This `FastAPI service for fetching Stripe paid sessions` is a foundational component and is utilized **across all three parts** of the series for consistent payment data integration.
- `events-v2` **folder**: Contains code **explicitly used only in the setup described in Part 2**, focusing on early enhancements and specific Wix Velo interactions for that phase.
- `events-v3` **folder**: Contains code **explicitly used only in the setup described in Part 3**, showcasing advanced integrations like the JWT microservice and refined Wix Velo interactions.
- **Part 1**: The initial setup for Part 1 relies solely on basic n8n functionalities and Wix Automations. Therefore, **no additional custom code** is specifically provided in a dedicated folder for this part.

Each sub-folder within this repository contains its own, detailed `README.md` file, providing in-depth information about that specific component and its setup.
