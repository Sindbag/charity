import pickle
import json

vk_friends = pickle.load(open('pickled-data/vk_friends.pickle', 'rb'))
vk_posts = pickle.load(open('pickled-data/vk_posts.pickle', 'rb'))

# find first post for user
first_posts = {}
for k, post in vk_posts.items():
    user, _ = k.split('_')
    user = int(user)
    if user in first_posts:
        continue
    first_posts[user] = post

# find if any of friends has the post after the user's
links = []
for user, post in first_posts.items():
    dt = post['date']
    for friend in vk_friends[str(user)]:
        if friend in first_posts and first_posts[friend]['date'] > dt:
            links.append((user, friend))

points = []
for i, j in links:
    points.append(i)
    points.append(j)

data = {
    "nodes": [{"id": str(user), "group": 1} for user in first_posts],
    "links": [{"source": str(i), "target": str(j), "value": 3} for i, j in links] #+ [{"source": str(points[0]), "target": str(i), "value": 3} for i in points]
}

print(json.dumps(data, indent=4, sort_keys=True))