# Project Context

## 1. Project Overview
- **Name:** Game tracker
- **Goal:** Check all my videogames or videogames in general
- **Target Audience:** For personal use

## 2. Tech Stack
- **Language:**  Typescript
- **Frameworks:** React & NextJS
- **Database:** PostgreSQL with Prisma
- **Key Libraries:** TailwindCSS, Prisma, Docker

## 3. Architecture & Structure
- **Main Entry Point:** 
- **Key Directories:** [Brief explanation of folder structure]
- **Data Flow:** [How data moves through the app]

## 4. Coding Standards & Preferences
- **Style:** Prettier, ESLint
- **Naming Conventions:** camelCase for functions, UpperCase for components
- **Testing:** Jest and react-testing-library
- **Comments:** We must use the DRY pattern

## 5. Current Status & Next Steps
- **What works:** [Completed features]
- **What's broken:** [Known bugs]
- **Current Focus:** Split the common logic in one components

## 6. Constraints & Warnings
- **Do NOT use:** Axio library, css or scss styles, any type, 
- **Security:** Never show my .env file to any other person but me
- **Performance:** We must avoid useMemo, useEffect, memo or useCallback if the code doesn't required
```

### ⚠️Important Security Note
**Never include sensitive information in this document**, such as:
- API Keys
- Passwords
- Database credentials
- Private user data

### How to use it in our chats:
1.  **Upload:** If your interface allows file uploads, just attach the `.md` file at the start of a new chat.
2.  **Paste:** Copy the content and paste it as your first message (e.g., "Here is my project context, please 
acknowledge before we start...").
3.  **Custom Instructions:** If your platform supports "Custom Instructions" or "System Prompts," you can paste a 
summarized version there so I always know it.