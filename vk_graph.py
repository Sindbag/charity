import pickle
import json

vk_fliends = pickle.load(open('pickled-data/vk_friends.pickle', 'rb'))
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
    for friend in vk_fliends[str(user)]:
        if friend in first_posts and first_posts[friend]['date'] > dt:
            links.append((user, friend))

points = []
for i, j in links:
    points.append(i)
    points.append(j)
#print(links)

data = {
    "nodes": [{"id": p, "group": 1} for p in points],
    "links": [{"source": i, "target": j, "value": 1} for i, j in links]
}

print(json.dumps(data))