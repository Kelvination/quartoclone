# QuartoClone

A real-time multiplayer game application built with React and Node.js.

## Architecture

- **Client**: React + TypeScript + Vite + Socket.io-client
- **Server**: Node.js + Express + Socket.io

## Development

### Prerequisites
- Node.js (v16 or higher)
- pnpm

### Setup
1. Install dependencies for both client and server:
   ```bash
   cd client && pnpm install
   cd ../server && pnpm install
   ```

2. Start the development servers:
   ```bash
   # Terminal 1 - Start server
   cd server && pnpm start
   
   # Terminal 2 - Start client
   cd client && pnpm dev
   ```

3. Open http://localhost:5173 to view the application

## Deployment

The application is deployed on AWS Lightsail for public access.

## Features

- Real-time multiplayer gameplay
- Socket.io for real-time communication
- Modern React frontend with TypeScript
- Express.js backend