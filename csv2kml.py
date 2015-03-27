from random import *

def getLatLong(line):
	splitLine = line.split(",")
	return "" + str(splitLine[22]) + "," + str(splitLine[21]) + ",0"

sourceFile = open("trafficcalming.csv", "r")
targetFile = open("traffic_calming_test.kml", "w")

targetFile.write('<?xml version="1.0" encoding="UTF-8"?>')
targetFile.write('<kml xmlns="http://www.opengis.net/kml/2.2">')
targetFile.write('<Document>')

lines = iter(sourceFile)
next(lines)

for line in lines:
	targetFile.write('<Placemark>\n')

	targetFile.write('<name>Hello World' + str( random() ) + '</name>')
	targetFile.write('<description>Blah</description>\n')

	targetFile.write('<Point>\n')
	targetFile.write('<coordinates>')
	targetFile.write(getLatLong(line))
	targetFile.write('</coordinates>\n')
	targetFile.write('</Point>\n')
	
	targetFile.write('</Placemark>\n\n')

targetFile.write('</Document>')
targetFile.write('</kml>')

targetFile.close()
sourceFile.close()