import os,re,hmac
from flask import Flask,request,jsonify
app=Flask(__name__)
app.config['MAX_CONTENT_LENGTH']=32768
KEY=os.getenv('SERVICE_API_KEY','local-service-key')
if os.getenv('APP_ENV')=='production' and KEY=='local-service-key':
 raise RuntimeError('Set SERVICE_API_KEY in production.')
POSITIVE=set('fantastic excellent great good amazing wonderful helpful friendly easy love loved recommend professional transparent best happy perfect satisfied efficient honest'.split())
NEGATIVE=set('bad awful terrible horrible rude slow worst poor disappointed disappointing broken dishonest expensive frustrating hate hated unhappy unhelpful'.split())
NEGATIONS=set("not no never neither hardly isn't wasn't don't didn't can't couldn't wouldn't".split())
def analyze_text(text):
 words=re.findall(r"[a-z]+(?:'[a-z]+)?",text.lower())
 score=0
 for i,word in enumerate(words):
  value=1 if word in POSITIVE else -1 if word in NEGATIVE else 0
  if any(w in NEGATIONS for w in words[max(0,i-3):i]): value=-value
  score+=value
 return {'sentiment':'positive' if score>0 else 'negative' if score<0 else 'neutral',
         'score':score,'method':'lexicon-v1'}
@app.before_request
def authorize():
 if request.path!='/health' and not hmac.compare_digest(request.headers.get('X-Service-Key',''),KEY):
  return jsonify(error='Service authentication required.'),401
@app.get('/health')
def health(): return jsonify(status='ok',service='sentiment')
@app.post('/analyze')
def analyze():
 data=request.get_json(silent=True)
 if not isinstance(data,dict) or not isinstance(data.get('text'),str) or not 1<=len(data['text'].strip())<=5000:
  return jsonify(error='Text must contain 1 to 5,000 characters.'),400
 return jsonify(analyze_text(data['text']))
if __name__=='__main__': app.run(host=os.getenv('HOST','127.0.0.1'),port=int(os.getenv('PORT','5050')),debug=False)
