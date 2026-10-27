# Final assessment — 28-task submission guide

Status: the application is implemented and running locally. Source files exist, local API evidence has been captured, and one screenshot of the anonymous dealership page exists. Public repository: https://github.com/badjadgup/cars-dealership-capstone. GitHub Actions evidence and cloud deployment still need verification. Browser automation stopped before the remaining UI evidence could be captured.

## Task-by-task checklist

| Task | Points | Submission                                                           | Current status                                        |
| ---- | -----: | -------------------------------------------------------------------- | ----------------------------------------------------- |
| 1    |      1 | Public GitHub URL of `README.md`                                     | Published on GitHub                           |
| 2    |      1 | Paste `evidence/django_server`                                       | Captured from the actual running server               |
| 3    |      3 | Public URL of `server/frontend/static/About.html`                    | Published on GitHub                           |
| 4    |      2 | Public URL of `server/frontend/static/Contact.html`                  | Published on GitHub                           |
| 5    |      2 | Paste `evidence/loginuser`                                           | Real cURL command/response captured                   |
| 6    |      2 | Paste `evidence/logoutuser`                                          | Real cURL command/response captured                   |
| 7    |      1 | Public URL of `server/frontend/src/components/Register/Register.jsx` | Published on GitHub                           |
| 8    |      2 | Paste `evidence/getdealerreviews`                                    | Captured                                              |
| 9    |      2 | Paste `evidence/getalldealers`                                       | Captured                                              |
| 10   |      2 | Paste `evidence/getdealerbyid`                                       | Captured                                              |
| 11   |      2 | Paste `evidence/getdealersbyState`                                   | Captured; three Kansas branches                       |
| 12   |      2 | `admin_login.png` or `.jpeg`                                         | Still capture: signed-in root admin dashboard         |
| 13   |      1 | `admin_logout.png` or `.jpeg`                                        | Still capture: admin logged-out confirmation          |
| 14   |      2 | Paste `evidence/getallcarmakes`                                      | Captured; five makes                                  |
| 15   |      2 | Paste `evidence/getallcarmakes`                                      | Captured; thirteen nested models                      |
| 16   |      2 | Paste `evidence/analyzereview`                                       | Captured; Fantastic services → positive               |
| 17   |      1 | `get_dealers.png` or `.jpeg`                                         | Captured anonymous local dealership page              |
| 18   |      2 | `get_dealers_loggedin.png` or `.jpeg`                                | Still capture: username + Review Dealer + address bar |
| 19   |      2 | `dealersbystate.png` or `.jpeg`                                      | Still capture: Kansas selected + address bar          |
| 20   |      1 | `dealer_id_reviews.png` or `.jpeg`                                   | Still capture: dealer details, reviews + address bar  |
| 21   |      1 | `dealership_review_submission.png` or `.jpeg`                        | Still capture: filled form before Publish review      |
| 22   |      2 | `added_review.png` or `.jpeg`                                        | Still capture: actual newly posted review             |
| 23   |      3 | Paste `evidence/CICD`                                                | Pending an actual successful Actions run              |
| 24   |      1 | URL saved as `evidence/deploymentURL`                                | Pending actual cloud deployment                       |
| 25   |      2 | `deployed_landingpage.png` or `.jpeg`                                | Pending cloud deployment                              |
| 26   |      2 | `deployed_loggedin.png` or `.jpeg`                                   | Pending cloud deployment; username visible            |
| 27   |      2 | `deployed_dealer_detail.png` or `.jpeg`                              | Pending cloud deployment                              |
| 28   |      2 | `deployed_add_review.png` or `.jpeg`                                 | Pending cloud deployment                              |

Tasks 14 and 15 share one file and together carry four points. Total: 50 points; passing threshold: 35/50 (70%). The grader decides whether each submission satisfies its criteria.

## Publish your source on GitHub

1. Create a GitHub account if needed, then create an empty **public** repository named `cars-dealership-capstone`. Do not add an initial README, license, or .gitignore to that remote.
2. From this project folder, initialize Git if needed and commit:

```powershell
git init -b main
git add .
git status
# Check that no database, .env, password file, cookie jar, or node_modules is staged.
git commit -m "Build Cars Dealership full-stack capstone"
git remote add origin https://github.com/YOUR_USERNAME/cars-dealership-capstone.git
git push -u origin main
```

If Git asks for your author identity, configure your own name and GitHub email before committing. Sign in using Git's normal credential flow. Do not paste access tokens into repository files.

3. Confirm these files open while signed out (replace YOUR_USERNAME and use your actual repository name):

```text
https://github.com/badjadgup/cars-dealership-capstone/blob/main/README.md
https://github.com/badjadgup/cars-dealership-capstone/blob/main/server/frontend/static/About.html
https://github.com/badjadgup/cars-dealership-capstone/blob/main/server/frontend/static/Contact.html
https://github.com/badjadgup/cars-dealership-capstone/blob/main/server/frontend/src/components/Register/Register.jsx
```

The four file links above point to this project’s public main branch.

## Capture the local screenshots

Use a regular desktop browser with the URL bar visible. Store files in `evidence/`. A full-window capture is useful when the rubric requires the endpoint. Do not crop away the URL or the username. The header stays visible when you scroll through the dealerships.

1. Visit `/admin/`, sign in as your superuser, and capture the dashboard as **admin_login**. Choose Log out and capture the confirmation as **admin_logout**. The locally prepared admin account is `root`; its private credentials are in the separate LOCAL_ACCESS.md output, outside the repository.
2. Visit `/dealers` while logged out. The existing **get_dealers.jpeg** is a genuine capture of this state.
3. Register or sign in as a regular user, visit `/dealers`, and scroll enough to show the cards and **Review Dealer** controls while keeping the header and URL bar visible. Capture **get_dealers_loggedin**.
4. Select **Kansas** in the State dropdown. The URL becomes `/dealers?state=Kansas`. Capture **dealersbystate**.
5. Open **Prairie Auto House** (`/dealers/1`). Show its details and customer reviews. Capture **dealer_id_reviews**.
6. Choose **Review Dealer**, fill the rating, car make/model, model year, purchase date, and review. Choose a purchase date in the past. Before publishing, capture **dealership_review_submission**.
7. Choose **Publish review**. Confirm your name and text appear on the dealer page, and capture **added_review**. If the app reports an error, resolve it rather than submitting an earlier sample review as your new review.

Example review: “Fantastic services! The team was friendly, helpful, and transparent throughout my purchase. I would recommend Prairie Auto House.”

## CI and cloud evidence

After pushing, open **Actions → Capstone CI**. Wait for every step to succeed. If anything fails, fix it and rerun. Install and authenticate the GitHub CLI if using the collector, then:

```powershell
python scripts/capture_ci.py ACTUAL_RUN_ID --repo YOUR_USERNAME/cars-dealership-capstone
```

This saves the successful run's actual step logs in `evidence/CICD`. Alternatively download/copy the real logs from GitHub. Local test output cannot substitute for Task 23.

Follow DEPLOYMENT.md to deploy with your IBM Cloud account. Save the real public HTTPS URL in `evidence/deploymentURL`. From that public URL, capture the landing page, logged-in page with username, dealer details, and a review you actually publish. Use the exact four deployed image names from the table. Localhost screenshots cannot substitute for deployment screenshots.

Only after the pending items are complete, begin the Coursera assessment, paste the requested public file links and command outputs, upload the matching images, and review your entries before submitting.
