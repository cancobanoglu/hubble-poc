__author__ = 'cancobanoglu'

import bottle, os, config, sys
from bottle import route
from datetime import datetime
from bottle import static_file

currentPath = os.path.dirname(__file__)
parentPath = os.path.abspath(os.path.join(currentPath, os.path.pardir))

paths = [
    currentPath,
    parentPath
]

for path in paths:
    if path not in sys.path:
        sys.path.insert(0, path)

os.chdir(currentPath)


print sys.path

from controllers import analyze, home

#
# Add view paths to the Bottle template path
#
TEMPLATE_SUB_PATHS = os.walk(config.BASE_TEMPLATE_PATH).next()[1]
bottle.TEMPLATE_PATH.append(config.BASE_TEMPLATE_PATH)

for templatePath in TEMPLATE_SUB_PATHS:
    bottle.TEMPLATE_PATH.append(os.path.join(config.BASE_TEMPLATE_PATH, templatePath))

if config.DEBUG:
    print "ROOT_PATH: %s" % config.ROOT_PATH
    print "Template Paths:"

    for it in bottle.TEMPLATE_PATH:
        print "   %s" % it

    print ""

    print "System paths:"
    for it in paths:
        print "   %s" % it

    print "\n%s\n" % datetime.today()


@route('/')
def route_index():
    return 'Application Home Page'


@route("/resources/<filepath:path>")
def serve_static(filepath):
    return static_file(filepath, root=config.RESOURCES_PATH)


bottle.debug(config.DEBUG)
app__ = bottle.app()

bottle.run(host="0.0.0.0", port=config.BIND_TO_PORT, workers=4, proc_name="APP",
           daemon=True)
