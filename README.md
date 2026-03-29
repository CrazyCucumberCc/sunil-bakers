# Sunil Bakers

Premium bakery website built with HTML, CSS, JavaScript, and Node.js + Express.

## Run locally

1. Install dependencies with `npm install`
2. Create a `.env` file from `.env.example`
3. Start the server with `npm start`
4. Open `http://localhost:3000`

## Notes

- Use a Gmail app password for `EMAIL_PASS` if using Gmail SMTP.
- Static files are served from the `public` folder.
- The contact form posts to `/api/contact`.
- Admin panel is available at `http://localhost:3000/admin.html`
- Customer order tracking is available at `http://localhost:3000/track-order.html`

## Before pushing to GitHub

- Keep `.env` private and never commit it
- `public/uploads/` is ignored because gallery uploads are runtime content
- Review `data/store.json` and remove any private test users, sessions, or orders if needed

## Before going live

1. Deploy the full project together on a Node host such as Render
2. Add the real environment variables on the host:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CONTACT_RECEIVER`
   - `SESSION_SECRET`
3. Replace any `http://localhost:3000` metadata URLs in `public/index.html` with the real live domain
4. Test:
   - homepage
   - admin login
   - order enquiry
   - gallery upload
   - order tracking
