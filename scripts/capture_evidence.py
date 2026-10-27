"""Record real cURL responses using a disposable local assessment account."""
import argparse, json, os, shlex, shutil, subprocess, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--base-url', default='http://127.0.0.1:8000')
args = parser.parse_args()
base = args.base_url.rstrip('/')
user = os.environ.get('CAPSTONE_USERNAME')
password = os.environ.get('CAPSTONE_PASSWORD')
if not user or not password:
    raise SystemExit('Set CAPSTONE_USERNAME and CAPSTONE_PASSWORD to a disposable local assessment account.')
curl = shutil.which('curl.exe') or shutil.which('curl')
if not curl:
    raise SystemExit('Install curl first.')
out = ROOT / 'evidence'
with tempfile.TemporaryDirectory(prefix='course-curl-') as temporary:
    jar = str(Path(temporary) / 'cookies')
    def invoke(path, extra=None):
        command = [curl, '--silent', '--show-error', '--fail-with-body', '--max-time', '30',
                   '--cookie', jar, '--cookie-jar', jar] + (extra or []) + [base + path]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return command, result.stdout
    def save(name, command, output):
        # Show the demonstration payload but keep live session tokens out of published files.
        safe = [part.replace(jar, 'session.cookies') for part in command]
        safe = ['X-CSRFToken: $CSRF_TOKEN' if part.startswith('X-CSRFToken:') else part for part in safe]
        text = 'Executed cURL command (cookie filename and CSRF token normalized):\n' + shlex.join(safe)
        text += '\n\nActual terminal output:\n' + output + '\n'
        (out / name).write_text(text, encoding='utf-8')
        print('Captured ' + name)
    token = json.loads(invoke('/api/csrf/')[1])['csrfToken']
    payload = json.dumps({'userName': user, 'password': password})
    save('loginuser', *invoke('/djangoapp/login', ['--request', 'POST', '--header', 'Content-Type: application/json',
         '--header', 'X-CSRFToken: ' + token, '--data', payload]))
    for name, path in [('getdealerreviews', '/fetchReviews/dealer/1'), ('getalldealers', '/fetchDealers'),
                       ('getdealerbyid', '/fetchDealer/8'), ('getdealersbyState', '/fetchDealers/Kansas'),
                       ('getallcarmakes', '/djangoapp/get_cars'), ('analyzereview', '/analyze/Fantastic%20services')]:
        save(name, *invoke(path))
    save('logoutuser', *invoke('/djangoapp/logout'))
