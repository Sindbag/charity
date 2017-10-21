import tweepy
import time
#insert your Twitter keys here
consumer_key ='FlaqsArAj7huFc5X2It5EwtLg'
consumer_secret='pOWDmEP8IIKHORZclGpmpRih3tHMOSAP1tCsnmKsyIu0IpZrMH'
access_token='188373465-KoMwg0OQPq1uXvHdOFduwVNuv32XewCMQrrwigUb'
access_secret='u1TJ8ujFX0LX57V4QKLajoXRBenkrp1dwiUnFQfYpyWlL'
twitter_handle='handle'

auth = tweepy.auth.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_secret)
api = tweepy.API(auth)

list= open('twitter_followers.txt','w')

if(api.verify_credentials):
    print 'We successfully logged in'

for page in tweepy.Cursor(api.followers_ids, screen_name="McDonalds").pages()
user = tweepy.Cursor(api.followers, screen_name=twitter_handle).items()

while True:
    try:
        u = next(user)
        list.write(u.screen_name +' \n')

    except:
        time.sleep(15*60)
        print 'We got a timeout ... Sleeping for 15 minutes'
        u = next(user)
        list.write(u.screen_name +' \n')
list.close()