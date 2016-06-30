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


def intersects_clause(included_ids, geom_column, route_wkt):
    # clause = "SELECT ST_Intersects(%s, ST_GeographyFromText(E'SRID=4326;%s'))" % (wkb, route_wkt)
    # return clause

    clause = "SELECT * from poi_isoline " \
             "where source_id in (%s) " \
             "AND ST_Intersects(%s, ST_GeographyFromText('%s'))" % (
                 remove_brackets_from_str_array(included_ids), geom_column, route_wkt)

    return clause


def find_places_of_intersected_ones(included_ids, geom_column, route_wkt):
    query = "SELECT * FROM poi_place WHERE here_id in (%s)"

    sub_clause = "SELECT source_id from poi_isoline " \
                 "where source_id in (%s) " \
                 "AND ST_Intersects(%s, ST_GeographyFromText('%s'))" % (
                     remove_brackets_from_str_array(included_ids), geom_column, route_wkt)

    return query % (sub_clause)


def remove_brackets_from_str_array(array):
    return ", ".join(repr(str(e)) for e in array)
