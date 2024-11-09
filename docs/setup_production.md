#Setting up Production

## Login/signup challenges a.k.a. CAPTCHAS
One of the most pernacious issues on the public facing internet is keeping your submission forms safe from bots.

Loom has you covered though, with a mechanism for enabling Cloudflare turnstiles. The project is open to other forms of CAPTCHA and bot mitigation work on the login/signup flow though.

Enabling the Cloudflare Turnstile, at the moment, is the domain of instance Operators. By default the turnstile will not be available.

### Enabling Cloudflare Turnstile
1) To start, either create or log in to your Cloudflare account : https://www.cloudflare.com/application-services/products/turnstile/
1) Once you're set up and logged in, go to the Turnstile section of your account and click `Add Widget`.
1) Enter the relevent information about your website (don't forget a subdomain if you're using one). Pick the managed widget while you're at it.
1) You should now get a site key and secret key. Keep track of those, you'll need them for the next step.
1) In your `.env.production` file, add your site key and secret key as PUBLIC_CF_SITEKEY=<site_key> & CF_SECRETKEY=<secret_key>
    1) If those attributes are in the file, Loom will attempt to utilize the Cloudflare turnstile with the provided data. Remove the values from those attributes to disable the turnstile.

That's it! Once you've got everything configured properly, kick of a new deploy of the instance and you should now be protected from rogue bots.
