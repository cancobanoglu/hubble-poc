__author__ = 'cancobanoglu'


def within_clause(table_name, latitude, longitude, distance):
    """Return a within clause that explicitly casts the `latitude` and
      `longitude` provided to geography type.
    """

    attr = '%s.location' % table_name

    point = 'POINT(%0.8f %0.8f)' % (longitude, latitude)
    location = "ST_GeographyFromText(E'SRID=4326;%s')" % point

    return 'ST_DWithin(%s, %s, %d)' % (attr, location, distance)


def buffer_clause(wkt, radius_of_buffer):
    """Return a buffered polygon
    """

    clause = "ST_AsText(ST_Buffer(ST_GeographyFromText(E'SRID=4326;%s'),%s)) as buffered_polygon" % (
        wkt, radius_of_buffer)

    return clause


# def contained_clause_within(wkt):
#     clause = "SELECT p.* FROM poi_place p WHERE ST_Covers(ST_GeographyFromText('%s'), p.location::geography)" % (
#         wkt)
#
#     return clause


def contained_clause_within(wkt):
    clause = "SELECT p.* FROM poi_place p WHERE ST_Covers(ST_GeographyFromText('%s'), ST_GeographyFromText(ST_AsText(ST_MakePoint(p.lat,p.lng))))" % (
        wkt)
    return clause
