# Amrit Aarogyam — Landing Page

Static HTML/CSS/JavaScript landing page with PHP SMTP enquiry endpoint.

## GitHub Pages

Website address: https://vaividhyasakshi-commits.github.io/amrit-arogyam-LP/

The GitHub Actions workflow publishes `index.html`, `css/`, `js/` and `images/` whenever `main` is pushed. PHP source and SMTP configuration are excluded from the deployed website. GitHub Pages does not run the PHP enquiry endpoint; use the Call or WhatsApp links for enquiries on this deployment. Email submission requires PHP hosting.

## Project folders

```
index.html
css/style.css       Original responsive layout styles
css/theme.css       Brand colours, fonts and visual refinements
js/app.js           Menu, gallery, tabs and form validation/submission
images/logo.png     Supplied Amrit Aarogyam logo
images/IMAGE-NAMES.txt  Required filenames and image sizes
php/send-enquiry.php    Secure server-side validation + SMTP handler
php/config.example.php SMTP configuration template
composer.json       PHPMailer dependency
.htaccess           Basic Apache access protection
```

## Run locally

For visual development, open `index.html` with Live Server in VS Code. PHP forms will **not** send through Live Server.

For form delivery, use PHP hosting (Apache + PHP 8.1+ with `mbstring` and OpenSSL). In the project root run:

```bash
composer install --no-dev --optimize-autoloader
```

Copy `php/config.example.php` to `php/config.php`, enter your SMTP sender/app password and recipients. Never commit `php/config.php` or upload it to a public repository.

For local testing on XAMPP, place the entire project inside `htdocs`, configure PHP and Composer, and open it at `http://localhost/your-folder/` instead of using the static Live Server port. On Hostinger PHP hosting, upload the whole folder including `vendor/`, or run Composer on the server.

## Adding images

There are **no stock photos** included. Put your own WebP assets in `images/` using the exact filenames from `images/IMAGE-NAMES.txt`. Until supplied, sections display a coloured visual placeholder. The original user-supplied logo is already included.

## Enquiry handling

- Both the hero form and modal form POST to `php/send-enquiry.php`.
- Client and server validate name, phone, residence type, message length and consent.
- The server returns JSON and does not reveal SMTP errors to visitors.
- The mail recipient is controlled by `php/config.php`.
- Before production, add a server-side rate limit and CAPTCHA/honeypot appropriate to your hosting to reduce spam.
- `php/send-enquiry.php` will not run on GitHub Pages, static Sites hosting or any other static-only host. Use PHP hosting or replace the endpoint with a serverless API.

## Important content checks

Confirm current project prices, availability, floor plans, facilities, RERA particulars and claims with the developer before final publication. Visual placeholders do not imply they depict the actual property.
