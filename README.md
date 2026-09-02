# home-server-chores
Household chore management app that automates recurring task scheduling and tracks completion history.

- `backend/` — Django + Django REST Framework API, SQLite database, dependencies managed with [uv](https://docs.astral.sh/uv/).
- `frontend/` — TypeScript + React app built with Vite.

Chores have a description, an assignee, a due date, and an optional recurrence (every N days/weeks/months). Checking off a recurring chore archives it and automatically creates its next occurrence. Daily view lets you check chores off; weekly and monthly views are read-only calendars; the archive lists completed chores and who completed them. There's no login — pick your name from the switcher in the top bar before checking things off.

## Running locally

**Backend** (http://localhost:8000):

```sh
cd backend
uv run manage.py migrate
uv run manage.py runserver
```

Optionally create an admin user with `uv run manage.py createsuperuser` to manage data at `/admin/`.

**Frontend** (http://localhost:5173):

```sh
cd frontend
npm install
npm run dev
```

The frontend reads its API base URL from `frontend/.env` (`VITE_API_BASE_URL`, defaults to `http://localhost:8000/api`).

## Running on the LAN

This is meant to run on a home server and be used from other devices on the network (phones, laptops), not just from the machine it's running on. Vite's dev server already binds to all interfaces (`server.host: true` in `frontend/vite.config.ts`), but a few things need to point at the server's LAN address (e.g. `192.168.0.102`) instead of `localhost`:

- **Backend**: bind `runserver` to all interfaces, and allow the LAN host/origin:

  ```sh
  cd backend
  DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,192.168.0.102 \
  DJANGO_CORS_ALLOWED_ORIGINS=http://192.168.0.102:5173 \
  uv run manage.py runserver 0.0.0.0:8000
  ```

  `DJANGO_ALLOWED_HOSTS` and `DJANGO_CORS_ALLOWED_ORIGINS` are comma-separated and default to `localhost,127.0.0.1` and `http://localhost:5173` respectively (see `backend/config/settings.py`).

- **Frontend**: point `frontend/.env` at the server's LAN address:

  ```
  VITE_API_BASE_URL=http://192.168.0.102:8000/api
  ```

Then visit `http://192.168.0.102:5173` from any device on the network.

## Tests

```sh
cd backend
uv run manage.py test
```
