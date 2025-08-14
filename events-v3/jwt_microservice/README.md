# FastAPI JWT Generator 🔐

This repository contains a simple FastAPI application designed to generate **JSON Web Tokens** (JWTs) for specific purposes, primarily for secure integration with **n8n workflows**.

## 🛠️ Technical Details

This **FastAPI/Python script** is built to be easily deployable as a **Docker** container and provides dedicated endpoints to generate JWTs using pre-configured secrets. It's intended to be called by an n8n workflow that requires JWT-based authentication for downstream services.

### 📦 Prerequisites

- **[Docker Desktop](https://docs.docker.com/get-docker/)**: For containerizing and running the application.
- **n8n**: [Installed locally with Docker](https://docs.n8n.io/hosting/installation/docker/).
- **Python 3.x**: (Optional, for local development/testing outside Docker)
- **Secret Keys**: You'll need pre-shared secret keys for JWT signing, which will be stored in your `.env` file.

### 🖥️ Operating System Used

- Linux Mint 21.2

## 🔄 How Does it Work?

This FastAPI application exposes two distinct API endpoints, each configured to generate a JWT using a specific secret key:

1. **Loads Environment Variables** 🔒: Upon startup, the application securely loads JWT secret keys (`EVENT_GUESTS_JWT_SECRET`, `GUEST_PHONE_JWT_SECRET` and `UPDATE_CONTACT_JWT_SECRET`) from a `.env` file. This is crucial for keeping your sensitive secrets out of the codebase.

2. **JWT Generation Logic** ✨: The core logic for JWT generation is encapsulated in the `generate_n8n_jwt` function:

   - It creates a standard JWT payload including `sub` (subject), `iat` (issued at time), and `exp` (expiration time). The default expiration is 15 minutes (900 seconds) to ensure tokens are short-lived for security.

   - It uses the `HS256` (HMAC-SHA256) algorithm to sign the token with the provided `secretKey`.

     ➕ Need a random `secretKey`? Use [random.org/strings](https://www.random.org/strings/) to generate one.

3. **Dedicated Endpoints** 🔗:

   - `GET /generate-jwt/eventGuests`: When this endpoint is called, it generates a JWT using the `EVENT_GUESTS_JWT_SECRET`.

   - `GET /generate-jwt/guestPhone`: This endpoint generates a JWT using the `GUEST_PHONE_JWT_SECRET`.
   - `GET /generate-jwt/updateContact`: This endpoint generates a JWT using the `UPDATE_CONTACT_JWT_SECRET`

4. **Returns JWT** ✅: Each endpoint returns a JSON object containing the newly generated JWT.

This setup is ideal for scenarios where your n8n workflows need to interact with external APIs or services that require JWT authentication. By centralizing JWT generation in this microservice, you keep your secret keys secure and provide a simple, callable endpoint for your workflows.

## 🏁 Getting Started

Follow these steps to set up and run the FastAPI JWT Generator.

### 📝 Configuration

1.  **Create a `.env` file**:  
    In the root directory of this project (`/jwt_microservice`), rename the `.env.example` to `.env`.
2.  **Add Your JWT Secret Keys**:  
     Populate the `.env` file with your secret keys. These should be strong, randomly generated strings.

    ```
      EVENT_GUESTS_JWT_SECRET=your-event-guests-jwt-secret
      GUEST_PHONE_JWT_SECRET=your-guest-phone-jwt-secret
      UPDATE_CONTACT_JWT_SECRET=your-update-contact-jwt-secret
    ```

    - **Important**: Replace the placeholder values with your actual, unique secret keys.
    - **Security Tip**: Never commit your `.env` file to version control.

### 🐳 Running FastAPI/Python script with Docker

This is the recommended way to run the application for production or integration with n8n.

#### ✅ 1. Build the Docker Image

In your terminal, navigate to your project root (where your `Dockerfile` and `.env` are located) and run the following command to build the Docker image:

```Bash
docker build -t fastapi-jwt-service .
```

#### ✅ 2. Run the Docker Container

Still in your project root, run the following command to start the Docker container:

```Bash
docker run -it --rm \
 --name fastapi-jwt-service \
 -p 8000:8000 \
 --env-file .env \
 fastapi-jwt-service
```

This command does the following:

- `--name fastapi-jwt-service`: Assigns a name to your running container, making it easier to manage.
- `-p 8000:8000`: Exposes port 8000 of the Docker container to port 8000 on your host machine. This makes the API accessible from your host.
- `--env-file .env`: Injects your environment variables from the .env file into the container, ensuring your secret keys are available for JWT generation.

Once the container is running, the FastAPI application will be accessible.

#### ✅ 3. Test Your Local API

You can test the running API endpoints using curl or by configuring an n8n HTTP node.

- 💻 With `curl`  
  Open another terminal and use `curl` to send a GET request to an endpoint:

```Bash
curl http://localhost:8000/generate-jwt/eventGuests

# Or for the other endpoint:

curl http://localhost:8000/generate-jwt/guestPhone

# Or for the third endpoint:

curl http://localhost:8000/generate-jwt/updateContact
```

You should receive a JSON response containing the generated JWT:

```JSON
{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

- 📡 With **n8n HTTP node**  
  If you're integrating with **n8n**, configure an **HTTP Request node** with one of the following `URLs`:

[http://host.docker.internal:8000/generate-jwt/eventGuests](http://host.docker.internal:8000/generate-jwt/eventGuests)

[http://host.docker.internal:8000/generate-jwt/guestPhone](http://host.docker.internal:8000/generate-jwt/guestPhone)

[http://host.docker.internal:8000/generate-jwt/updateContact](http://host.docker.internal:8000/generate-jwt/updateContact)

This `URL` is crucial for inter-container communication in **Docker** environments.

### 🐳 Running n8n with Docker

#### ✅ Run the Docker Container

Open another terminal and run the following command to start your **n8n** instance:

```bash
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

## 🧠 Explanations

### 💡 Why `docker run` and Not `docker-compose`?

You might notice that the **FastAPI** service and **n8n** instance are started using individual `docker run` commands instead of being managed by `docker-compose`. This is a valid and often preferred approach for simpler setups or when services don't share a lifecycle.

- `docker run`: Best suited for running and configuring single containers. It gives you direct control over _ports_, _volumes_, and _environment variables_. Since **FastAPI** and **n8n** are independent and self-contained, using `docker run` for each is straightforward and sufficient.

- `docker-compose`: Designed for orchestrating _multi-container_ applications using a `docker-compose.yml` file. It’s ideal when services are tightly coupled (e.g., an app with a database and cache), but it introduces extra overhead when not strictly needed.

In this setup, **FastAPI** and **n8n** are deployed independently and communicate over the **host network**. That’s why `host.docker.internal` is used.

### 🌐 Understanding `http://host.docker.internal` for n8n

When running multiple containers on the same host, they need a way to communicate. Using `localhost` inside a container doesn’t point to the host machine—it refers to the container itself.

- `localhost` **inside a container**: If **n8n** tries to access `http://localhost:8000/fetch-paid-sessions`, it will look for a service inside the **n8n** container—likely leading to a connection error.

- `host.docker.internal`: This special DNS name resolves to the IP address of the host machine (available by default on **Docker** Desktop for macOS/Windows and configurable on Linux). It allows containers to access services exposed by other containers via the host.

_Example_: A request from **n8n** to `http://host.docker.internal:8000` reaches the **Docker** host, which forwards it to `port 8000` of the **FastAPI** container—assuming it's been published with `-p 8000:8000`.

This setup works well for lightweight, decoupled containers when you don’t want to set up a shared **Docker** network or use `docker-compose`.

### 📚 Related Concepts

This project illustrates several important technologies:

- **JSON Web Tokens (JWT)**: A compact, URL-safe format for securely transmitting information between parties. A JWT contains a set of claims encoded as a JSON object and is digitally signed to ensure authenticity and integrity. JWTs are commonly used for authentication and authorization in web applications.

- **FastAPI**: A modern, high-performance web framework for building APIs with Python 3.7+ and type hints.

- **Docker**: A platform for packaging and running applications in isolated containers.

- **n8n**: A low-code automation tool that connects services, syncs data, and automates workflows through a visual interface.

### 🔐 Security Considerations

- **Secret Management**: Never hardcode your JWT secrets directly in your codebase. Instead, store them in environment variables (as done in this project) and manage them securely—using Docker Secrets, Kubernetes Secrets, or a dedicated secrets manager in production environments.

- **Token Expiration (TTL)**: Use short-lived tokens to minimize risk if a token is compromised. This application defaults to a **15-minute TTL**, which provides a good balance between security and usability.

- **Algorithm**: This setup uses `HS256`, a symmetric algorithm where the same secret is used for both signing and verification. Be sure this secret is never exposed client-side. For more advanced scenarios—such as third-party token validation or distributed systems—consider using an asymmetric algorithm like `RS256`.

## ⚠️ A Note on Code Examples and Debugging

The code examples throughout this project intentionally include numerous `console.log` statements.

**Wix's Velo environment** can be tricky. These logs act as a trail, letting you see exactly what's happening and confirming that data is being passed correctly. Without them, it would be very difficult to find issues.

For **production**, you can remove most of these logs. They are essential for this tutorial but can be reduced once your automation is stable.
