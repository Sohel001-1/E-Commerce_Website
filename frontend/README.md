Project Setup:
1. Clone the repository
    git clone <your-repo-url>
    cd E-Commerce_Website

2. Setup Node Version
    nvm install
    nvm use

3. Install Dependencies
    cd frontend
    npm install

4. Run the Developement Server
    npm run dev

Project Structure:
frontend/
  src/
    components/
    pages/
    assets/
    App.jsx
    main.jsx

Team Workflow:
Node version is locked using .nvmrc
package-lock.json must always be committed
Feature work should be done on branches
Pull requests required before merging

Common Commands:
    npm run dev      # start dev server
    npm run build    # production build
    npm run preview  # preview build


Contribution Rules:
Use clean, meaningful commit messages
Keep components modular
Do not commit node_modules
Run project before pushing