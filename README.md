# DataMorpher

**DataMorpher** is a full-stack web application based on Django and React, designed to provide users with features like data upload and data type inference. This project integrates the Celery asynchronous task queue and leverages Docker and Docker Compose for one-click deployment and startup.

## Tech Stack

### Backend:

- **Django** 3.2.20
- **Django REST Framework** 3.14.0
- **Celery** 5.2.7
- **Redis** 6
- **pandas** 1.5.3
- **numpy** 1.23.5

### Frontend:

- **React** 18.2.0
- **axios** 1.5.0
- **React Scripts** 5.0.1

### Containerization & Deployment:

- **Docker**
- **Docker Compose**

## Features

- **File Upload**: Supports file uploads via the frontend interface (e.g., CSV).
- **Data Type Inference**: Backend uses pandas and numpy to analyze the uploaded data and infer the data types of each column (e.g., string, integer, float, date, etc.).
- **Asynchronous Task Processing**: Uses Celery to handle data processing tasks asynchronously, improving system responsiveness and performance.
- **One-Click Startup**: Uses Docker and Docker Compose for containerized deployment, allowing for a one-click startup of all services.

## Directory Structure

```
DataMorpher/
├── DataMorpher/          # Django backend project directory
│   ├── __init__.py
│   ├── celery.py         # Celery configuration file
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/                  # Backend API app
│   ├── __init__.py
│   ├── tasks.py          # Celery task definitions
│   ├── utils.py          # Utility functions, including data type inference
│   ├── views.py          # API views
│   └── urls.py
├── frontend/             # React frontend project directory
│   ├── Dockerfile
│   ├── nginx.conf        # Nginx configuration file
│   ├── package.json
│   ├── public/
│   └── src/
├── manage.py
├── docker-compose.yml
├── requirements.txt      # Backend dependencies
└── README.md
```

## Installation and Startup Guide

### Requirements

- Operating System: Windows, macOS, or Linux
- **Docker**: Ensure Docker is installed (Docker Desktop)
- **Docker Compose**: Typically included with Docker Desktop

### Clone the Project

```bash
git clone https://github.com/yourusername/DataMorpher.git
cd DataMorpher
```

### Start the Project

In the root directory of the project, run the following command:

```bash
docker-compose up --build
```

This command will build and start all services, including the backend, frontend, Celery workers, and Redis.

### Access the Application

- **Frontend**: Access it in your browser at [http://localhost:3000](http://localhost:3000)
- **Backend API**: Access it in your browser or API client at [http://localhost:8000/api/](http://localhost:8000/api/)

## Detailed Explanation

### 1. Configuration Files

- **Backend Environment Variables**: In `DataMorpher/settings.py`, environment variables are used to configure Celery and Redis.

```python
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
```

- **Frontend Environment Variables**: During frontend image build, use `REACT_APP_API_URL` to specify the backend API address.

### 2. Dockerization

- **Backend Dockerfile**: Located in the project root directory to build the Django app image.
- **Frontend Dockerfile**: Located in the `frontend/` directory, using multi-stage builds to build the React app into static files and serve them using Nginx.
- **Docker Compose Configuration**: The `docker-compose.yml` defines all services, including the backend, frontend, Celery, and Redis.

### 3. Asynchronous Task Processing

- **Celery Configuration**: Configured in `DataMorpher/celery.py`, using Redis as the message broker and result backend.
- **Task Definition**: Asynchronous data processing tasks are defined in `api/tasks.py`.
- **Result Retrieval**: Task results can be retrieved through frontend polling or backend callbacks.

## Major Dependencies

### Backend

Backend dependencies are listed in `requirements.txt`:

```plaintext
amqp==5.2.0
asgiref==3.8.1
billiard==4.2.1
celery==5.4.0
click==8.1.7
click-didyoumean==0.3.1
click-plugins==1.1.1
click-repl==0.3.0
Django==5.1.2
django-cors-headers==4.5.0
djangorestframework==3.15.2
kombu==5.4.2
numpy==2.1.2
pandas==2.2.3
prompt_toolkit==3.0.48
python-dateutil==2.9.0.post0
pytz==2024.2
redis==5.1.1
six==1.16.0
sqlparse==0.5.1
tzdata==2024.2
vine==5.1.0
wcwidth==0.2.13

```

### Frontend

Frontend dependencies are listed in `frontend/package.json`:

```json
{
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.114",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "axios": "^1.7.7",
    "http-proxy-middleware": "^3.0.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4"
  }
}
```

## Common Issues

1. **Docker not running or unable to connect**

   - Solution: Ensure Docker Desktop is correctly installed and running. You can verify this with the following command:

   ```bash
   docker version
   ```

2. **Frontend cannot access backend API**

   - Solution: Check if the API requests in the frontend are pointing to the correct backend address. Make sure the `REACT_APP_API_URL` environment variable is correctly set during frontend build.

3. **Files not found during image build**
   - Solution: Ensure that all necessary files (e.g., `nginx.conf`) are present in the build context and that the paths in the Dockerfile's `COPY` instructions are correct.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact Information

If you have any questions or issues while using the project, feel free to contact me:

- **Email**: huqy1021_cd@outlook.com
- **GitHub**: [yourusername](https:github.com/DarcyHU999)

Thank you for your interest and support of DataMorpher!
