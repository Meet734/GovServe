# GovServe

## Introduction

GovServe is a remote complaint management system that allows citizens to submit complaints online and enables administrators to track and resolve them efficiently.

## Installation

Follow these steps to set up and run the project locally:

### Prerequisites

Make sure you have the following installed on your system:

- Node.js and npm (Node Package Manager)
- MySQL Server

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/govserve.git
2. **Navigate to the project directory:**
   ```bash
   cd GovServe
3. **Install dependencies:**
   ```bash
   npm install
4. **Database Setup:**
   Create a MySQL database named govserve.
   Import the schema from database/govserve.sql into the govserve database.
5. **Start the server:**
   ```bash
   cd src/backend
   node server.js
6. **Start the server:**
   Open your web browser and navigate to http://localhost:3000 to access the GovServe application.
