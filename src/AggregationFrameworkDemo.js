var favorites = ["Tom Hanks","Julia Roberts","Kevin Spacey","George Clooney"];

db.movies.aggregate([
    {$match: {"tomatoes.viewer.rating": {$gte:3}, countries:"USA", cast:{$in:favorites } }},
    {$addFields: {num_favs: {$setIntersection:[favorites,"$cast"]}}},
    {$match:{num_favs:{$elemMatch:{$exists:true} } } },
    {$addFields:{num:{$size:"$num_favs" } } },
    {$sort: {nums: -1, "tomatoes.viewer.rating": -1, title:1}},
    {$skip: 24},
    {$limit:1}
]).pretty()

var x_min = xxx; var x_max = rrr;
db.movies.aggregate([
    {$match: {languages:{$all:["English"] }, "imdb.rating": {$gte:1}, "imdb.votes" : {$gte:1}, year: {$gte: 1990} } },
    {$addFields:{scaled_votes:{$add:[1,{$multiply:[9,{$divide:[{$subtract:["$imdb.votes",x_min]},{$subtract:[x_max,x_min]}]} ] } ] } }  },
    {$addFields: {normalized_rating: {$avg:["$scaled_votes", "$imdb_rating"]}}},
    {$sort: {normalized_rating:1}},
    {$limit:1}
]).pretty()
