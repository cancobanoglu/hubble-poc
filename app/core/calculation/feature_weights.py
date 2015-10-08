import math

__author__ = 'merve'


def calculate_c(alphas):
    if len(alphas) == 0:
        print "alpha size is zero"
        return
    c = 0
    for i in range(0, len(alphas)):
        c += math.pow(alphas[i], 2)
    return c/(2*len(alphas))


def calculate_weight_point(features, alphas, thetas):
    if len(features) != len(thetas) | len(features) == 0 | len(thetas) == 0:
        print "error on sizes of features or thetas"
        return
    weight_point = 0
    features = scale_features(features)
    for i in range(0, len(thetas)):
        weight_point += thetas[i] * features[i]
    weight_point += calculate_c(alphas)
    return weight_point


def scale_features(features):
    mean = sum(features) / len(features)
    divider = max(features) - min(features)
    for i in range(0, len(features)):
        features[i] = (features[i] - mean) / divider
    return features
