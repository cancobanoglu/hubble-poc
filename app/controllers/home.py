from bottle import view, route, request


@route("/home")
@view("public_transport_route")
def home():
    return dict()
