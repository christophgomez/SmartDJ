import numpy as np
import cv2 as cv
import sys

okay_cascade = cv.CascadeClassifier('/Users/Chris/Desktop/Programming/SmartDJNewFrontEnd/computer-vision/haarcascades/haarcascade_okaygesture.xml')
vicky_cascade = cv.CascadeClassifier('/Users/Chris/Desktop/Programming/SmartDJNewFrontEnd/computer-vision/haarcascades/haarcascade_vickygesture.xml')

img = cv.imread(sys.argv[1])
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

okay = okay_cascade.detectMultiScale(gray, 1.3, 5)
# vicky = vicky_cascade.detectMultiScale(gray, 1.3, 5)

if len(okay) > 0:
	print("1")
else:
	print("Didn't detect any gestures")
