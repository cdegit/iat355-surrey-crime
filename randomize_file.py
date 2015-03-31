# http://stackoverflow.com/questions/4618298/randomly-mix-lines-of-3-million-line-file
import random
with open('data/crime2013.csv','r') as source:
    data = [ (random.random(), line) for line in source ]
data.sort()
with open('data/random_crime2013.csv','w') as target:
    for _, line in data:
        target.write( line )