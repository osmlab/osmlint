#### Description

Check invalid motorway junction according:

-  Number of lanes should be equal to lanes in destination:lanes and destination:ref:lanes tags
-  Change destination:street=* to destination=* (Only for California)
-  If there is SR in destination:ref change it to CA
-  A destination tag should have name of the destination but not the reference of the destination.
   Example: destination= CA 101 (Wrong), destination=Oakland (Correct), destination:ref=CA 101 (Correct) and destination:ref=Oakland (Wrong)
-  All the abbreviations in destination=* should be elaborated
-  Look for | in destination=* and destination:ref=* and replace them with ; but not in destination:lanes





