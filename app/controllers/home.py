from bottle import view, route, request


@route("/home")
@view("home")
def home():
    return 'asdasa'
