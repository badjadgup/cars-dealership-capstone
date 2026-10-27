# Assessment evidence
Only files generated from real executions belong here. No cloud deployment or GitHub Actions success is claimed.

Run `python scripts/capture_evidence.py` against the running app with a disposable existing account in CAPSTONE_USERNAME and CAPSTONE_PASSWORD.
The recorder invokes cURL itself. It normalizes temporary cookie/payload paths and the CSRF value in the displayed commands. Actual JSON response bodies are saved verbatim. Get a new CSRF token after login because Django rotates it.

To repeat the login command manually, first create a private login-secret.json containing the test username/password, request /api/csrf/ while saving session.cookies, and set CSRF_TOKEN from the returned JSON. Use double quotes around the X-CSRFToken header so your shell expands the variable. Never commit the private payload or session cookies.

Local server startup writes django_server. Capture browser screenshots with the address bar visible, using the exact names listed in SUBMISSION_GUIDE.md. The screenshot must come from a real running browser. No altered or simulated browser frames should be submitted.

After the repository workflow succeeds, run `python scripts/capture_ci.py RUN_ID --repo USER/REPO`. It verifies success before saving CICD.
After deploying, save the real HTTPS app URL (one line) in deploymentURL. Then take the four deployed screenshots from that URL.
