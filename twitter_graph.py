import tweepy
import json
import time                                       

consumer_key ='FlaqsArAj7huFc5X2It5EwtLg'
consumer_secret='pOWDmEP8IIKHORZclGpmpRih3tHMOSAP1tCsnmKsyIu0IpZrMH'
access_token='188373465-KoMwg0OQPq1uXvHdOFduwVNuv32XewCMQrrwigUb'
access_secret='u1TJ8ujFX0LX57V4QKLajoXRBenkrp1dwiUnFQfYpyWlL'
twitter_handle='handle'

auth = tweepy.auth.OAuthHandler(consumer_key, consumer_secret) 
auth.set_access_token(access_token, access_secret)
api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True, compression=True)

data = json.load(open('pickled-data/tweets-vtornik.json'))
users = list(set([i['user'] for i in data]))

links = []
for user in users:
    for follower in users:
        try:
            data = api.show_friendship(source_screen_name=user, target_screen_name=follower)
        except:
            print(user, follower)
            continue
        if any([i.followed_by for i in data]):
            links.append((user, follower))

points = []
for i, j in links:
    points.append(i)
    points.append(j)

data = {
    "nodes": [{"id": str(user), "group": 1} for user in users],
    "links": [{"source": str(i), "target": str(j), "value": 3} for i, j in links] #+ [{"source": str(points[0]), "target": str(i), "value": 3} for i in points]
}

print(json.dumps(data, indent=4, sort_keys=True))