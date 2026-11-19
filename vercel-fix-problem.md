# Vercel deployment fix

## What happened

The site uses two hosting services:

- **Vercel** builds and serves the React website in `frontend`.
- **Render** runs the FastAPI backend that provides project and GitHub data.

GitHub Actions connects these parts. It checks the code, builds the frontend, then deploys it to Vercel. At the end, it can also ask Render to redeploy the backend.

The deploy problems happened at different steps:

1. **Vite was not found.** Vite is a development dependency. The Vercel build environment did not find its local command. The Vercel install command now includes development dependencies, and the GitHub Actions build adds the frontend's local command folder to `PATH`.
2. **Vercel could not find `index.html`.** The Vercel project uses `frontend` as its Root Directory. The Vercel CLI was being run from the wrong folder. Running it from the repository root lets Vercel apply the configured Root Directory.
3. **The Render redeploy step failed.** The GitHub secret `RENDER_DEPLOY_HOOK_URL` was empty or missing. The workflow now reports this clearly and checks that the URL uses HTTPS. This step is separate from the Vercel website deployment.

## What happens now

On a push to `main`, GitHub Actions:

1. Runs backend tests.
2. Installs frontend packages, runs frontend tests, and checks the production build.
3. If those checks pass, asks Vercel to build and deploy the website.
4. Tries to trigger a Render backend redeploy using `RENDER_DEPLOY_HOOK_URL`.

Vercel also routes website requests starting with `/api/` to the Render backend. This is how the website can request project and GitHub data.

The Vercel build and deployment are working. The Render redeploy step only works when the backend has been set up on Render and its deploy-hook URL has been saved in GitHub Actions secrets as `RENDER_DEPLOY_HOOK_URL`. If that secret is not set, the website can still deploy to Vercel, but the workflow reports failure at the final Render step.

## What to remember

- **GitHub Actions** runs the automated steps.
- **CI** means checking and testing code before deployment.
- **CD** means deploying the website and, when configured, asking Render to redeploy the backend.
- **Vercel** hosts the frontend website.
- **Render** hosts the FastAPI backend.
- A successful Vercel deployment does not by itself confirm that the Render backend is running. Check the Render service and its health endpoint if backend data is unavailable.
