import json
import sys

def mergeFile(filename):
    f = open(filename)
    fc = {
        'type': 'FeatureCollection',
        'features': []
    }
    for line in f:
        obj = json.loads(line)
        fc['features'].extend(obj['features'])
    return fc

if __name__ == "__main__":
    filename = sys.argv[1]
    print json.dumps(mergeFile(filename))
