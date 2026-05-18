# Deployment

This portfolio is split into two free-hostable parts:

- Frontend: static HTML/CSS/JS on Vercel Hobby.
- Contact API: Vercel serverless function at `/api/contact`.

## Frontend On Vercel

Use Zarrar's Vercel account for these commands:

```bash
vercel login
vercel --prod
```

Recommended project name:

```text
zarrar-portfolio
```

The project is configured for a static Vercel deployment with `vercel.json`, and `.vercelignore` keeps backend files out of the public frontend deployment.

## Contact API On Vercel

The production frontend sends contact form submissions to:

```text
/api/contact
```

That endpoint is implemented in:

```text
api/contact.js
```

Set these Vercel project environment variables for production:


```text
SMTP_USER=zarrarabbas73@gmail.com
SMTP_PASS=<Gmail App Password>
CONTACT_RECEIVER=zarrarabbas73@gmail.com
CLIENT_URL=https://zarrar-portfolio-nine.vercel.app
```

Then deploy:

```bash
vercel deploy --prod
```

## Optional Render Backend

The `server/` Express backend and `render.yaml` remain in the repository if a separate Render backend is needed later. Render must have GitHub access to the repository before it can create that service.
