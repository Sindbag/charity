import json
import random

def proc_cluster(cluster, group):
    cities = [cluster[0][1]]
    edges = []
    stacks = [[cluster[0]]]
    i = 1
    while i < len(cluster) - 1:
        stack = min(len(cluster) - i, random.randint(1, max(len(cluster) // 2 - i, 1)))
        stacks.append(cluster[i: min(len(cluster), i + stack)])
        i += stack

    for j, st in enumerate(stacks[:-1]):
        for s, k in stacks[j + 1]:
            cities.append(k)
        for c in stacks[j + 1]:
            tmp = random.choice(st)
            edges.append({'coords': [
                    [tmp[1]['lat'], tmp[1].get('lng', tmp[1].get('lon'))],
                    [c[1]['lat'], c[1].get('lng', c[1].get('lon'))]
                ],
                'source': tmp[1]['city'],
                'target': c[1]['city'],
                'group': group
            })
    return (cities, edges)


from copy import deepcopy


def generate_clusters(num, data):
    clusters = []
    d = deepcopy(data)
    d = list(data.items())
    for i in range(num):
        random.shuffle(d)
        cluster = d[:random.randint(20, len(d) // 2)]
        d = d[random.randint(0, len(cluster)):]
        clusters.append(cluster)
    return clusters


cities_big = json.loads('front/data/cities_big.json')


clusters = generate_clusters(14, cities_big)

links = []
cities = []

for i, cl in enumerate(clusters):
    c, l = proc_cluster(cl, i)
    cities = cities + c
    links = links + l

with open('front/data/bigl.json', 'w') as f:
    f.write(json.dumps(links))

with open('front/data/bigc.json', 'w') as f:
    f.write(json.dumps(cities))
