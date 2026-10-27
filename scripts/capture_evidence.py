"""Execute REAL cURL requests against a running app, saving assessment transcripts.
Set CAPSTONE_USERNAME and CAPSTONE_PASSWORD; do not commit real credentials.
"""
import argparse,json,os,shlex,shutil,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--base-url',default='http://127.0.0.1:8000');args=p.parse_args()
base=args.base_url.rstrip('/');out=ROOT/'evidence';out.mkdir(exist_ok=True)
curl=shutil.which('curl.exe') or shutil.which('curl')
if not curl: raise SystemExit('Install curl first.')
user=os.getenv('CAPSTONE_USERNAME');password=os.getenv('CAPSTONE_PASSWORD')
if not user or not password: raise SystemExit('Set CAPSTONE_USERNAME and CAPSTONE_PASSWORD to an existing local test account.')
with tempfile.TemporaryDirectory(prefix='cars-evidence-') as tmp:
 jar=str(Path(tmp)/'session.cookies');payload=Path(tmp)/'login-secret.json'
 payload.write_text(json.dumps({'username':user,'password':password}),encoding='utf-8')
 def invoke(url,extra=None):
  command=[curl,'--silent','--show-error','--fail-with-body','--max-time','30','--cookie',jar,'--cookie-jar',jar]+(extra or [])+[base+url]
  result=subprocess.run(command,capture_output=True,text=True)
  if result.returncode: raise RuntimeError(result.stdout+result.stderr)
  return command,result.stdout
 def save(name,command,body):
  # Preserve the executed command except private temporary paths / CSRF value.
  safe=[a.replace(str(payload),'login-secret.json').replace(jar,'session.cookies') for a in command]
  safe=[('X-CSRFToken: $CSRF_TOKEN' if a.startswith('X-CSRFToken:') else a) for a in safe]
  text='COMMAND (shell variables and local file paths normalized):\n'+shlex.join(safe).replace("'X-CSRFToken: $CSRF_TOKEN'", '"X-CSRFToken: $CSRF_TOKEN"')+'\n\nACTUAL OUTPUT:\n'+body+'\n'
  (out/name).write_text(text,encoding='utf-8');print(name)
 token=json.loads(invoke('/api/csrf/')[1])['csrfToken']
 command,body=invoke('/api/login/',['--request','POST','--header','Content-Type: application/json','--header','X-CSRFToken: '+token,'--data-binary','@'+str(payload)])
 save('loginuser',command,body)
 for name,url in [('getdealerreviews','/api/dealers/1/reviews/'),('getalldealers','/api/dealers/'),('getdealerbyid','/api/dealers/1/'),('getdealersbyState','/api/dealers/?state=Kansas'),('getallcarmakes','/api/cars/'),('analyzereview','/api/analyze/?text=Fantastic%20services')]:
  save(name,*invoke(url))
 token=json.loads(invoke('/api/csrf/')[1])['csrfToken']
 save('logoutuser',*invoke('/api/logout/',['--request','POST','--header','X-CSRFToken: '+token]))
print('cURL evidence captured. Password and cookie jar were not saved in the repository.')
