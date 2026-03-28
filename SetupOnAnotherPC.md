# How to Install and Run on Another PC

If you want to move this project to another computer, you don't need to copy everything. The `package.json` file in this folder acts as your "requirements file." It lists all the necessary dependencies.

## Steps to Transfer and Run

1.  **Install Node.js:** On the new PC, download and install Node.js from [nodejs.org](https://nodejs.org/). This will install both `node` and `npm`.
2.  **Copy the Project:** Copy the entire `my-mobile-app` folder to the new PC.
    *   *Tip:* You can skip copying the `node_modules` folder, as it is very large and will be regenerated in the next step.
3.  **Install Requirements:**
    *   Open a terminal (Command Prompt or PowerShell) on the new PC.
    *   Navigate into the project folder:
        ```bash
        cd path/to/my-mobile-app
        ```
    *   Run the installation command. This reads your `package.json` and installs everything needed:
        ```bash
        npm install
        ```
4.  **Run the App:**
    *   Once the installation is complete, start the app:
        ```bash
        npm start
        ```
    *   Scan the QR code with the Expo Go app on your phone to view it.
