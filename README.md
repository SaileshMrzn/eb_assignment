# eb_assignment - Sailesh Maharjan

This is a NestJS project created for an assignment. It's a GraphQL API with user authentication, posts, and a follow system.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running [MongoDB](https://www.mongodb.com/) instance

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/SaileshMrzn/eb_assignment.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd eb_assignment
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
5.  Update the `.env` file with your local configuration, especially your MongoDB connection string and JWT secrets.

## Running the application

```bash
# development
npm run start:dev

# watch mode
npm run start:watch

# production mode
npm run start:prod
```

The application will be running on the port specified in your `.env` file (default is 3000). The GraphQL playground will be available at `http://localhost:3000/graphql`.

## Environment Variables

The project uses the following environment variables. Make sure to configure them in your `.env` file.

- `PORT`: The port the application will run on. (Default: `3000`)
- `MONGO_URI`: The connection string for your MongoDB database.
- `JWT_ACCESS_SECRET`: The secret key for signing JWT access tokens.
- `JWT_REFRESH_SECRET`: The secret key for signing JWT refresh tokens.
