#!/bin/bash
PATH=/bin:/usr/bin:
NONE='\033[00m'
GREEN='\033[01;32m'
YELLOW='\033[33m'
BOLD='\033[1m'
N='\n'
T='\t'
echo ${T}${BOLD}Available osmlint processors${N}${NONE}

echo ${GREEN}# osmlint bridgeonnode${NONE}
echo ${T}Identifies invalid nodes with bridge=* tags and sends them to stdout.
echo "${T}${YELLOW}osmlint bridgeonnode --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint filterdate${NONE}
echo ${T}Filters features added/modified and sends them to stdout.
echo "${T}${YELLOW}osmlint filterdate --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint filterusers${NONE}
echo "${T}Filters features touched by a set of users and sends them to stdout."
echo "${T}${YELLOW}osmlint filterusers --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint missinghighwaysus${NONE}
echo "${T}Compares OpenStreetMap to US Tiger data and outputs difference as geojson files to stdout."
echo "${T}${YELLOW}osmlint missinghighwaysus --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles tiger.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint missinglayerbridges${NONE}
echo "${T}Identifies bridges with a missing layer tag and sends them to stdout."
echo "${T}${YELLOW}osmlint missinglayerbridges --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint untaggedways${NONE}
echo "${T}Identifies ways with no tags at all and sends them to stdout."
echo "${T}${YELLOW}osmlint untaggedways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint selfintersectinghighways${NONE}
echo "${T}Identifies self intersecting highways and sends them to stdout."
echo "${T}${YELLOW}osmlint selfintersectinghighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint unconnectedhighways${NONE}
echo "${T}Identifies highway nodes ending near another highway, when the two highways don't intersect, and sends them to stdout."
echo "${T}${YELLOW}osmlint unconnectedhighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint crossingwaterwayshighways${NONE}
echo "${T}Identifies faulty intersections of waterways and highways and sends them to stdout."
echo "${T}${YELLOW}osmlint crossingwaterwayshighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint crossinghighways${NONE}
echo "${T}Identifies missing intersections when two highways cross each other and sends them to stdout."
echo "${T}${YELLOW}osmlint crossinghighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint unclosedways${NONE}
echo "${T}Identifies unclosed ways and sends them to stdout."
echo "${T}${YELLOW}osmlint unclosedways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint turnlanes${NONE}
echo "${T}Identifies invalid turnlanes and sends them to stdout."
echo "${T}${YELLOW}osmlint turnlanes --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint tigerdelta${NONE}
echo "${T}Identifies missing roads on osm which exist in TIGER 2015 and sends them to stdout."
echo "${T}${YELLOW}osmlint tigerdelta --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint strangelayer${NONE}
echo "${T}Identifies strange layers in objects and sends them to stdout."
echo "${T}${YELLOW}osmlint strangelayer --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint overlaphighways${NONE}
echo "${T}Identifies highways that overlap other highways without a shared node and sends them to stdout."
echo "${T}${YELLOW}osmlint overlaphighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint mixedlayer${NONE}
echo "${T}Identifies ways which are intersecting in a node and they have a tag with different layers and sends them to stdout."
echo "${T}${YELLOW}osmlint mixedlayer --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint missingoneways${NONE}
echo "${T}Identifies motorway links without oneway tag , which is connected to a highway=motorway with a oneway and sends and them to stdout."
echo "${T}${YELLOW}osmlint missingoneways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint islandshighways${NONE}
echo "${T}Identifies highways that are disconnected from other highways in the same area and sends them to stdout."
echo "${T}${YELLOW}osmlint islandshighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint impossibleoneways${NONE}
echo "${T}Identifies imposible one ways and sends them to stdout."
echo "${T}${YELLOW}osmlint impossibleoneways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint impossibleangle${NONE}
echo "${T}Identifies highways with less likely turning angles. The threshold currently is less than 30 degrees and sends them to stdout."
echo "${T}${YELLOW}osmlint impossibleangle --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint fixmetag${NONE}
echo "${T}Identifies all objects which has fixme tag and them to stdout."
echo "${T}${YELLOW}osmlint fixmetag --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint deprecatehighways${NONE}
echo "${T}Identifies highways which are deprecated and them to stdout."
echo "${T}${YELLOW}osmlint deprecatehighways --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

echo ${GREEN}# osmlint crossinghighwaysbuildings${NONE}
echo "${T}Identifies all highways that intersect with buildings and them to stdout."
echo "${T}${YELLOW}osmlint crossinghighwaysbuildings --bbox=\"[7.4, 43.7, 7.4, 43.7]\" --zoom=12 osm.mbtiles${NONE}${N}"

tput sgr0