# Markovate Backend

## Description

This repository is the official backend for markovate

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## Installation

Steps to set up the project locally.

1. Clone the repository:

   ```bash
   git clone <repo link>
   cd yourproject
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables: - Create a `.env` file in the root directory. - Add the required environment variables as shown in the below:
   ```bash
        NODE_ENV=development
        HOST_PORT=9876

        CLIENT_URL=http://localhost:3000

        DB_USER=
        DB_HOST=    
        DB_DATABASE=
        DB_PASSWORD=
        DB_PORT=5432

        TOKEN_SECRET=

        HOST_EMAIL_ADDRESS=
        HOST_EMAIL_PASSWORD=
    ```

## Usage

Instructions for running the project.

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Access the application:
   server will be activated in `http://localhost:9876`

## Technologies Used

A list of technologies and libraries used in the project.

- Node.js
- Express.js
- PostgreSQL

## Contributing

Guidelines for contributing to the project.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request
