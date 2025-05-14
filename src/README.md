# Product Import

A NestJS app that imports products from an external API and provides REST endpoints for accessing the data.

## Features

- Import products from external API
- Paginated product listing
- Product search by title
- Individual product details
- Background processing using Bull queue
- Docker

## Requirements

- Docker
- Docker Compose

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the application:
```bash
docker-compose up --build
```

The application will be available at http://localhost:3000

## API Endpoints

- `POST /products/import` - Start product import
- `GET /products` - List all products (with pagination and search)
- `GET /products/:id` - Get product details

## API Documentation

Swagger documentation is available at http://localhost:3000/api
