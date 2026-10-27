"""Start the three services. Run from anywhere with Python 3.11+ and Node 22+."""
import argparse,os,subprocess,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--skip-install',action='store_true',help='Use current Python and already-installed Node modules')
args=parser.parse_args()
def run(command,cwd=ROOT): subprocess.run(command,cwd=cwd,check=True)
npm='npm.cmd' if os.name=='nt' else 'npm'
python=sys.executable
if not args.skip_install:
 venv=ROOT/'.venv'
 if not venv.exists(): run([python,'-m','venv',str(venv)])
 python=str(venv/('Scripts/python.exe' if os.name=='nt' else 'bin/python'))
 run([python,'-m','pip','install','-r','server/requirements.txt','-r','services/sentiment/requirements.txt'])
 for relative in ['services/dealership','server/frontend']: run([npm,'ci'],ROOT/relative)
run(['node','node_modules/vite/bin/vite.js','build'],ROOT/'server/frontend')
run([python,'manage.py','migrate','--noinput'],ROOT/'server')
run([python,'manage.py','seed_cars'],ROOT/'server')
processes=[]; handles=[]
try:
 for name,command,folder in [
  ('dealership',['node','index.js'],'services/dealership'),
  ('sentiment',[python,'app.py'],'services/sentiment'),
  ('django_server',[python,'-u','manage.py','runserver','127.0.0.1:8000','--noreload'],'server')]:
  target=ROOT/'evidence'/name
  target.parent.mkdir(exist_ok=True)
  log=target.open('w',encoding='utf-8'); handles.append(log)
  log.write('COMMAND: '+' '.join(command)+'\n');log.flush()
  processes.append(subprocess.Popen(command,cwd=ROOT/folder,stdout=log,stderr=subprocess.STDOUT,
   creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0,env={**os.environ,'PYTHONUNBUFFERED':'1'}))
 print('Cars Dealership: http://127.0.0.1:8000',flush=True)
 print('Logs: evidence/django_server, evidence/dealership, evidence/sentiment',flush=True)
 print('Create an administrator in another terminal: .venv/Scripts/python server/manage.py createsuperuser',flush=True)
 print('Press Ctrl+C to stop.',flush=True)
 while all(p.poll() is None for p in processes): time.sleep(1)
 if any(p.returncode not in (None,0) for p in processes): raise RuntimeError('A service stopped. Check the evidence logs.')
except KeyboardInterrupt: pass
finally:
 for p in processes:
  if p.poll() is None: p.terminate()
 for p in processes:
  try:p.wait(timeout=8)
  except subprocess.TimeoutExpired:p.kill()
 for h in handles:h.close()
