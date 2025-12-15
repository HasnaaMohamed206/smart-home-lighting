# Smart Lighting Home

An intelligent Smart Lighting Home system developed using Prolog (TUe Prolog) with a JavaScript-based UI.  
The project demonstrates a rule-based expert system for controlling home lighting, integrating Prolog logic with modern web technologies.

---

## Project Overview

The Smart Lighting Home project simulates a smart home environment where lights are automatically controlled based on various conditions and user interactions.  
Prolog (TUe Prolog) is used as the reasoning engine to handle the rule-based logic, while JavaScript, HTML, and CSS form the user interface for easy interaction.

---

## Project Objectives

1. Develop a rule-based lighting control system using Prolog.
2. Integrate the Prolog logic with a JavaScript-based UI for real-time interaction.
3. Provide an intuitive user interface for controlling and visualizing the lighting system.
4. Document the system architecture, logic, and usage in an organized manner.

---

## Features

- Automatic lighting control based on predefined rules.
- Interactive UI for manual and automated control.
- Integration of Prolog reasoning with JavaScript frontend.
- Well-documented system and source code.
- Easy to run locally or host using GitHub Pages.

---

## Project Structure

├── index.html # Main UI entry point
├── style.css # CSS styles for the UI
├── app.js # JavaScript for UI interactions
├── smart-home.pl.js # Prolog logic integrated with JS
├── doc/
│ └── samrt-home-doc/ # Project documentation (report, diagrams, etc.)
└── README.md # Project overview and instructions


---

## How It Works

1. **Prolog Logic:**  
   - Rules are defined in `smart-home.pl.js` to determine when lights should turn on/off based on conditions such as time, presence, or user input.

2. **JavaScript UI:**  
   - `app.js` handles user interactions, sending commands to the Prolog logic and updating the UI dynamically.

3. **HTML/CSS:**  
   - `index.html` provides the visual interface.  
   - `style.css` manages the layout and appearance of the system.

4. **Interaction Flow:**  
   - User opens `index.html`.  
   - The UI displays available lights and controls.  
   - When user interacts or conditions change, Prolog rules execute and update the UI automatically.

---

## How to Run

### Option 1: Local
1. Open the project folder in VS Code (or any code editor).
2. Ensure an active internet connection (required for external libraries/links).
3. Open `index.html` in a browser, or run via the **Live Server** extension.
4. Interact with the Smart Lighting Home system through the UI.

### Option 2: Online (GitHub Pages)
1. Host the repository using **GitHub Pages** (set source branch: `main`, folder: `/root`).  
2. Open the repository URL; `index.html` loads automatically as the main interface.

---

## Technologies Used

- **Prolog (TUe Prolog):** Rule-based reasoning engine.
- **JavaScript:** UI interaction and logic integration.
- **HTML / CSS:** User interface design.
- **GitHub Pages:** Hosting the live demo.

---

## Live Demo

The project UI can be hosted using GitHub Pages. Once set up, accessing the repository URL automatically loads `index.html`:
