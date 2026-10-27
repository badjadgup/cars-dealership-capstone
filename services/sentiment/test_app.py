import unittest
from app import app,analyze_text,KEY
class SentimentTests(unittest.TestCase):
 def test_positive(self): self.assertEqual(analyze_text('Fantastic services')['sentiment'],'positive')
 def test_negative(self): self.assertEqual(analyze_text('Terrible service and rude staff')['sentiment'],'negative')
 def test_neutral(self): self.assertEqual(analyze_text('The car is blue')['sentiment'],'neutral')
 def test_negation(self): self.assertEqual(analyze_text('not good')['sentiment'],'negative')
 def test_api(self):
  client=app.test_client()
  self.assertEqual(client.get('/analyze/Fantastic%20services').json,{'sentiment':'positive'})
  self.assertEqual(client.post('/analyze',json={'text':'great'}).status_code,401)
  self.assertEqual(client.post('/analyze',json={'text':''},headers={'X-Service-Key':KEY}).status_code,400)
  self.assertEqual(client.post('/analyze',json={'text':'Fantastic services'},headers={'X-Service-Key':KEY}).json['sentiment'],'positive')
if __name__=='__main__': unittest.main()
