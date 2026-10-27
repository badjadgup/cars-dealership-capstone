# Cars Dealership — Full Stack Application Development Capstone

A responsive dealership discovery and review application built from scratch for the supplied IBM Full Stack Application Development Capstone assessment. Browse eight fictional US branches, filter by state, register, sign in, and publish vehicle purchase reviews with sentiment analysis.

## What is implemented

- React frontend with responsive dealership cards, city/name search, state filtering, dealership details, reviews, sign-in, and five-field registration.
- Django backend for session authentication, CSRF protection, validation, car makes/models, and administration.
- Node.js/Express dealership and review service, with MongoDB in containers or a persistent JSON file in local development.
- Flask sentiment service with deterministic lexicon scoring, basic negation handling, and positive/negative/neutral labels. This is a transparent rule-based classifier, not IBM Watson or a trained language model.
- SQLite for local Django data; optional PostgreSQL configuration for durable serverless deployment.
- Dockerfiles, Docker Compose, Kubernetes example, GitHub Actions CI, automated checks, and real cURL evidence collection.

The branch records, team identities, contacts, and initial customer reviews are fictional demonstration data. Photos are externally hosted illustrative Unsplash images, and fonts load from Google Fonts. Review text submitted through the application is stored and displayed as user input.

## Run locally

Install Python 3.11+ and Node.js 22.12+ (tested with Python 3.13 and Node 22.14). From this project directory:

```powershell
python scripts/run_local.py
```

The script creates `.venv`, installs the Python and Node dependencies, builds React, migrates SQLite, seeds five makes and thirteen models, and starts all three services. Open http://127.0.0.1:8000. Press Ctrl+C in that terminal to stop them.

Use the Register page to create your own account. To create an administrator in a second terminal on Windows:

```powershell
.venv\Scripts\python server\manage.py createsuperuser
```

On macOS/Linux use `.venv/bin/python` instead. Dependencies already installed in the active interpreter? Use `python scripts/run_local.py --skip-install`.

Local services: Django 8000, Node 3030, Flask 5050. They bind to loopback by default. Local dealership data is written to `services/dealership/data/local.json`; Django writes `server/db.sqlite3`. Both are ignored by Git. The seed commands are repeatable and do not erase existing reviews.

## Use MongoDB with Docker

With Docker Desktop's Linux engine running:

```powershell
docker compose up --build
```

Open http://localhost:8000. Compose starts MongoDB plus the three application services and uses persistent named volumes for both databases. Create an admin with `docker compose exec web python manage.py createsuperuser`. Stop with `docker compose down`; named volumes remain.

The checked-in Compose configuration is for local development. Cloud setup uses unique secrets, HTTPS, explicit hostnames, private supporting services, and durable external databases; see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project layout

```text
server/
  config/                    Django settings and URL routing
  dealership/                Models, admin, validation, APIs, tests and seed command
  frontend/
    src/components/Register/Register.jsx
    src/main.jsx             React application routes and pages
    static/About.html
    static/Contact.html
    static/styles.css
services/
  dealership/                Express API, MongoDB/local store and seed data
  sentiment/                 Flask classifier and tests
scripts/                     Local launcher and evidence collectors
.github/workflows/ci.yml      Tests, frontend build and container builds
deploy/kubernetes.yaml       Single-replica example with persistent storage
evidence/                    Actual local execution evidence
```

## API reference

All browser calls go through Django. Mutations require a CSRF cookie and the token returned from `GET /api/csrf/` in `X-CSRFToken`. Login rotates the token; obtain a fresh one afterwards.

| Method    | Endpoint                                  | Purpose                                          |
| --------- | ----------------------------------------- | ------------------------------------------------ |
| GET       | `/api/csrf/`                              | Start a CSRF-protected session                   |
| POST      | `/api/register/`                          | username, first_name, last_name, email, password |
| POST      | `/api/login/`                             | Sign in with username/password                   |
| POST      | `/api/logout/`                            | Sign out                                         |
| GET       | `/api/me/`                                | Current session user                             |
| GET       | `/api/dealers/`                           | All dealerships                                  |
| GET       | `/api/dealers/?state=Kansas`              | Kansas branches; state abbreviations also work   |
| GET       | `/api/dealers/1/`                         | One dealership                                   |
| GET, POST | `/api/dealers/1/reviews/`                 | Read reviews; authenticated users may add one    |
| GET       | `/api/cars/`                              | Makes with their nested models                   |
| GET       | `/api/analyze/?text=Fantastic%20services` | Sentiment result                                 |
| GET       | `/health/`                                | Django liveness                                  |

Review input: `review` (10–5000 characters), `rating` (integer 1–5), `car_model_id` (existing ID), `car_year` (1980 to next year), and `purchase_date` (ISO date no later than today). The backend derives the author and sentiment; client-supplied author information is ignored.

Course-style API aliases under `/djangoapp/` are also included in `server/config/urls.py`. Frontend dealer pages live at `/dealers`, `/dealers/1`, and `/dealers/1/review`.

## Verify

Activate `.venv`, then run:

```powershell
python server/manage.py test
python server/manage.py makemigrations --check --dry-run
python server/manage.py check
```

From `services/sentiment`, run `python -m unittest -v`. From `services/dealership`, run `npm test`. From `server/frontend`, run `npm run build`. CI repeats these checks and builds all three containers. Its MongoDB service also exercises the actual MongoDB store.

A successful local run is not a successful GitHub Actions run. `evidence/local_validation.txt` records what was actually tested locally. Docker engine/container execution and cloud deployment still need validation in the target environment.

## Assessment submission

Follow [SUBMISSION_GUIDE.md](SUBMISSION_GUIDE.md) for all 28 tasks. Public source: [https://github.com/badjadgup/cars-dealership-capstone](https://github.com/badjadgup/cars-dealership-capstone). Successful GitHub Actions logs, cloud URL, and deployment screenshots must come from actual runs and deployment; see the submission checklist for remaining evidence.

To record real local cURL results with an account you created:

```powershell
$env:CAPSTONE_USERNAME = 'your-test-username'
# Set CAPSTONE_PASSWORD privately in your terminal; do not commit it.
python scripts/capture_evidence.py
```

Review the code and explain how the services work before submitting, and follow your course's rules on assistance and attribution.
