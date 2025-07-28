# FastAPI Stripe Session Fetcher 🚀

This directory contains a **FastAPI** application designed to **fetch and process paid checkout sessions from Stripe**.

## 🛠️ Technical Details

The **FastAPI/Python script** is built to be easily deployable as a **Docker** container and integrates with **n8n** workflow, also running on **Docker**.

### 📦 Prerequisites

- **[Docker Desktop](https://docs.docker.com/get-docker/)**: For containerizing and running the application.
- **n8n**: [Installed locally with Docker](https://docs.n8n.io/hosting/installation/docker/).
- **Python 3.x**: (Optional, for local development/testing outside Docker)
- **Stripe Account**: With access to your live secret API key and Payment Link IDs.

### 🖥️ Operating System Used

- Linux Mint 21.2

## 🔄 How Does it Work?

This FastAPI application provides a single endpoint (`/fetch-paid-sessions`) that, when called, performs the following actions:

1.  **Loads Environment Variables**: It securely loads your Stripe API key and specific Stripe Payment Link IDs from a `.env` file. This ensures sensitive information is not hardcoded.
2.  **Fetches Latest Paid Sessions from Stripe**: It connects to the Stripe API and retrieves all "paid" checkout sessions associated with the configured payment links.
3.  **Prevents Duplication**: To avoid processing the same sessions multiple times, it keeps track of the `last_run` timestamp. Only sessions created _after_ this timestamp are fetched and processed.
4.  **Extracts Key Information**: For each new paid session, it extracts relevant details such as the payment link ID, total amount, currency, customer email, name, and creation timestamp.
5.  **Saves Data Locally**: All newly found paid sessions are saved as a JSON file in the `app/stripe_exports` directory. Each file is timestamped (e.g., `paid_sessions_YYYY-MM-DD_HH-MM.json`) for easy organization and historical tracking.
6.  **Updates Last Run Timestamp**: After each execution, the application updates the `last_run.json` file with the current timestamp, preparing for the next run.
7.  **Returns Results**: The API endpoint returns a JSON response indicating the status of the operation (success, error, or no new data) and includes the fetched session data if available.

## 🏁 Getting Started

Follow these steps to set up and run the FastAPI Stripe Session Fetcher.

### 📝 Configuration

1.  **Create a `.env` file**:  
    In the root directory of this project (`/stripe_microservice`), rename the `.env.example` to `.env`.
2.  **Add your Stripe Credentials and Payment Link IDs**:  
    Populate the `.env` file with your Stripe Live Secret Key and the IDs of the payment links you want to monitor.

    ```dotenv
    STRIPE_LIVE_SECRET_KEY=sk_live_YOUR_STRIPE_LIVE_SECRET_KEY
    PLINK_CATEGORY_ONE=plink_YOUR_PAYMENT_LINK_ID_1
    PLINK_CATEGORY_TWO=plink_YOUR_PAYMENT_LINK_ID_2
    PLINK_CATEGORY_THREE=plink_YOUR_PAYMENT_LINK_ID_3
    ```

    - Replace `sk_live_YOUR_STRIPE_LIVE_SECRET_KEY` with your actual Stripe live secret key.
    - Replace `plink_YOUR_PAYMENT_LINK_ID_X` with the actual IDs of your Stripe Payment Links. You can find these in your Stripe Dashboard under "Payment Links".
    - **Security Tip**: Never commit your `.env` file to version control.

### 🐳 Running FastAPI/Python script with Docker

This is the recommended way to run the application for production or integration with **n8n**.

#### ✅ 1. Build the Docker Image

In your terminal, navigate to your project root (where your `Dockerfile` and `.env` are located) and run the following command to build the Docker image:

```bash
docker build -t fastapi-stripe-service .
```

#### ✅ 2. Run the Docker Container

Still in your project root (in this case `/stripe_microservice`), run the following command to start the Docker container:

```bash
docker run -it --rm \
 --name fastapi-service \
 -p 8000:8000 \
 --env-file .env \
 -v $(pwd)/app/stripe_exports:/app/app/stripe_exports \
 fastapi-stripe-service
```

This command does the following:

- `--name fastapi-service`: Assigns a name to your running container, making it easier to manage.

- `-p 8000:8000`: Exposes port 8000 of the Docker container to port 8000 on your host machine. This makes the API accessible from your host.

- `--env-file .env`: Injects your environment variables from the `.env` file into the container, ensuring your Stripe API key and payment link IDs are available.

- `-v $(pwd)/app/stripe_exports:/app/app/stripe_exports`: Mounts a **volume**. This creates a persistent link between the `app/stripe_exports` directory on your local machine and the `/app/app/stripe_exports` directory inside the Docker container. This ensures that the generated `paid_sessions.json` files are saved directly to your local machine, even if the container is removed.

Once the container is running, the FastAPI application will be accessible.

#### ✅ 3. Test Your Local API

You can test the running API endpoint using `curl` or by configuring an n8n HTTP node.

- 💻 With `curl`  
  Open another terminal and use `curl` to send a GET request to your API:

```bash

curl http://localhost:8000/fetch-paid-sessions
```

You should receive a JSON response containing the fetched session data or a status message.

- 📡 With **n8n HTTP node**  
  If you're integrating with **n8n**, configure an **HTTP Request node** with the following `URL`:

[http://host.docker.internal:8000/fetch-paid-sessions](http://host.docker.internal:8000/fetch-paid-sessions)

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

- **FastAPI**: A modern, high-performance web framework for building APIs with Python 3.7+ and type hints.

- **Docker**: A platform for packaging and running applications in isolated containers.

- **n8n**: A low-code automation tool that connects services, syncs data, and automates workflows through a visual interface.

## 🔗 Stripe API Reference

This application utilizes the **Stripe Checkout Sessions API**.  
For more details, see the official Stripe documentation:  
👉 [Returns a list of Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/list?lang=python)
