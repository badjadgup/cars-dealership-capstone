"""Capture the actual successful GitHub Actions step summary with the GitHub CLI after publishing."""
import argparse,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('run_id');p.add_argument('--repo',required=True);a=p.parse_args()
result=subprocess.run(['gh','run','view',a.run_id,'--repo',a.repo,'--json','conclusion,status'],capture_output=True,text=True,check=True)
import json
status=json.loads(result.stdout)
if status.get('conclusion')!='success': raise SystemExit('The workflow has not completed successfully. Fix it before recording CICD evidence.')
logs=subprocess.run(['gh','run','view',a.run_id,'--repo',a.repo,'--verbose'],capture_output=True,text=True,check=True)
(Path(__file__).resolve().parents[1]/'evidence'/'CICD').write_text(logs.stdout,encoding='utf-8')
print('Saved genuine successful Actions summary to evidence/CICD')
