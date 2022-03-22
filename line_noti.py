import requests,json
import urllib.parse
import sys

LINE_ACCESS_TOKEN="lhJwozPomKcGCi0rSQ29ecNzWUzKMVnajcogjDOqmzI"
url = "https://notify-api.line.me/api/notify" 

def line_text(message):	
	msg = urllib.parse.urlencode({"message":message})
	LINE_HEADERS = {'Content-Type':'application/x-www-form-urlencoded',"Authorization":"Bearer "+LINE_ACCESS_TOKEN}
	session = requests.Session()
	a=session.post(url, headers=LINE_HEADERS, data=msg)
	print(a.text)
	
def line_pic(pic,message):	
	msg = urllib.parse.urlencode({"imageThumbnail":pic,"imageFullsize":pic,"message":message})
	LINE_HEADERS = {'Content-Type':'application/x-www-form-urlencoded',"Authorization":"Bearer "+LINE_ACCESS_TOKEN}
	session = requests.Session()
	b=session.post(url, headers=LINE_HEADERS, data=msg)
	print(b.text)

if len(sys.argv) < 3:
	line_text(sys.argv[1])
else:
	line_pic(sys.argv[2],sys.argv[1])