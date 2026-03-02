# EmailJS Template Setup (Required for Ticket Links)

This project already sends a production ticket URL in `ticket_view_url`.
If your mail still opens `localhost` or `https://vishh70.github.io/email-template.html`, your EmailJS template is still hardcoded.

## Template to update

- EmailJS Service: `service_5jxxr2o`
- EmailJS Template: `template_vtgfowt`

## Required template variables

- `to_name`
- `to_email`
- `pass_type`
- `ticket_qty`
- `order_id`
- `ticket_view_url` (required for working button link)
- `ticket_route` (optional display/debug)
- `support_url` (optional support CTA)

## Required fixes in EmailJS dashboard

1. Open EmailJS template `template_vtgfowt`.
2. Find ticket button link (`href`) and replace hardcoded URL with:
   - `{{ticket_view_url}}`
3. Set button text to:
   - `View & Download Ticket`
4. Add plain-text fallback below button:
   - `If button doesn't work, open this URL: {{ticket_view_url}}`
5. Remove any hardcoded links containing:
   - `localhost`
   - `127.0.0.1`
   - `192.168.*`
   - `https://vishh70.github.io/email-template.html` (missing repo path)
6. Save template and send a fresh registration test.

## Expected final email link format

`https://vishh70.github.io/Live-Concert-Event-Landing-Page/email-template.html?name=...&pass=...&qty=...&email=...&phone=...&city=...&_v=...`

## Note about old broken emails

Already-sent emails cannot be edited retroactively.  
Only new registrations sent after the template fix will carry corrected links.
