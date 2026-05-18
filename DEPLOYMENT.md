# Deployment

This portfolio is split into two free-hostable parts:

- Frontend: static HTML/CSS/JS on Vercel Hobby.
- Contact API: Node/Express service on Render Free.

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

## Contact API On Render

Create a new Render Web Service from this GitHub repository and use the `server/` directory as the service root. The included `render.yaml` can also be used as a Render Blueprint.

Environment variables:

```text
SMTP_USER=zarrarabbas73@gmail.com
SMTP_PASS=<Gmail App Password>
CONTACT_RECEIVER=zarrarabbas73@gmail.com
CLIENT_URL=https://zarrar-portfolio.vercel.app
```

The frontend currently sends production contact requests to:

```text
https://zarrar-portfolio-api.onrender.com/api/contact
```

If Render gives the backend a different URL, update `PRODUCTION_CONTACT_API` in `js/main.js` and push the change.
