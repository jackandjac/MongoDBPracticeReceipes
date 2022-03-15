["Tom Hanks","Julia Roberts","Kevin Spacey","George Clooney"]

db.movies.aggregate([
{$match: {"tomatoes.viewer.rating":{$gte:3}, countries:"USA", cast:{$in:favorites}  }},
{$addFields: { num_favs: {$setIntersection:[favorites, "$cast"] }}},
{$match: {num_favs: {$elemMatch:{$exists:true}}}},
{$addFields: { nums: {$size:"$num_favs" }}},
{$sort:{nums:-1, "tomatoes.viewer.rating": -1, title:-1}},
{$skip: 24},
{$limit:1 }
]).pretty()


db.movies.aggregate([
 {$match: {languages: {$all:["English"]},"imdb.rating":{$gte:1}, "imdb.votes":{$gte:1}, year:{$gte:1990}  }},
 {$addFields: {scaled_votes: {$add:[1,{$multiply:[9,{$divide:[{$subtract:["$imdb.votes",x_min]},{$subtract: [x_max,x_min]}] }] }]}}},
 {$addFields: {normalized_rating: {$avg:["$scaled_votes","$imdb.rating"]}}}, 
 {$sort: {normalized_rating:1}},
 {$limit: 1}
 ]).pretty()

db.movies.aggregate([
 { $match: { awards: /Won \d{1,2} Oscars?/ }},
 { $group: { _id: null, std_voting: {$stdDevSamp:"$imdb.rating"}, high: {$max:"$imdb.rating" }, lowest: {$min: "$imdb.rating"}, avg: {$avg: "$imdb.rating"}}} 
 ]).pretty()

 db.movies.aggregate([
   {$match : { languages: {$all:["English"]}}},
   {$unwind: "$cast"},
   {$group: {_id: "$cast", numFilms:{$sum:1},average: {$avg: "$imdb.rating"}}},
   {$sort : {numFilms:-1}}
   ]).pretty()

 db.air_airlines.aggregate([
 { $lookup: { from: "air_routes", localField: "airline", foreignField: "airline.id", as: "air_routes" }},
 { $match: { air_routes: {$elemMatch: {$exists:true}}, "air_routes.airplane": /747|380/ }}, 
 { $project: { _id:-1, airline:1, name:1, "air_routes.src_airport":1, "air_routes.dst_airport":1, "air_routes.airplane":1 }}
]).pretty()

db.air_airlines.aggregate([ 
{ $lookup: { from: "air_routes", localField: "airline", foreignField: "airline.id", as: "air_routes" } }, 
{ $match: { air_routes: { $elemMatch: { airplane: /747|380/ } } } }
]). pretty()
    

db.air_airlines.aggregate([ 
  { $lookup: { from: "air_routes", localField: "airline", foreignField: "airline.id", as: "air_routes" } },
  { $match: { air_routes: { $elemMatch: {$exists: true } } } }
  ]). pretty()


db.air_routes.aggregate([
{ $match: { airplane: /747|380/ } },
{ $lookup: { from: "air_alliances", localField: "airline.name", foreignField: "airlines", as: "alliance"} },
{ $addFields:{alliance: "$alliance.name"  } },
{ $unwind: "$alliance"},
{ $group:{_id: "$alliance", routes:{$sum:1}  } }
]).pretty()

db.parent_reference.aggregate([
{$match: { name: 'Eliot' }},
{$graphLookup: { from: 'parent_reference', startWith: '$_id', connectFromField: '_id', connectToField: 'reports_to', as: 'all_reports'}}
]).pretty()

db.parent_reference.aggregate([
{$match: { name: 'Shannon' }},
{$graphLookup: { from: 'parent_reference', startWith: '$reports_to', connectFromField: 'reports_to', connectToField: '_id', as: 'bosses' }}]).pretty()


db.child_reference.aggregate([
{$match: {name: 'Dev'}},
{$graphLookup: { from:'child_reference', startWith:'$direct_reports', connectFromField:'direct_reports', connectToField: 'name', as:'Employees', maxDepth:1, depthField: 'level'}} 
]).pretty()


db.air_routes.aggregate([ 
{ $match: { src_airport: 'DTW' } }, 
  { $graphLookup: { from: 'air_routes', 
                    startWith: '$dst_airport', 
                    connectFromField: 'dst_airport', 
                    connectToField: 'src_airport', 
                    as: 'destinations', 
                    maxDepth: 0, 
                    depthField: 'Transit Stops' }
  }
]). pretty()

db.air_airlines.aggregate([
  {$match: {name:'TAP Portugal'}  },
  {$graphLookup:{
                  from:'air_routes', 
                  startWith: '$base', 
                  connectFromField:'dst_airport', 
                  connectToField: 'src_airport', 
                  as: 'Destinations', 
                  maxDepth: 1, 
                  depthField: 'stops to transits',
                  restrictSearchWithMatch: {"airline.name": 'TAP Portugal'} 
                } }
]).pretty()

db.air_alliances.aggregate([ 
  { $match: { name: 'OneWorld' } }, 
  { $graphLookup: { from: 'air_airlines', 
                    startWith: '$airlines', 
                    connectFromField: 'name', 
                    connectToField: 'name', 
                    as: 'airlines', 
                    maxDepth: 0, 
                    restrictSearchWithMatch: { country: { $in: ['Germany', 'Spain', 'Canada'] } } 
                    } 
  },
  {$unwind: "$airlines"},
  {$addFields: {base: "$airlines.base" ,alliance: "$name" , airline: "$airlines.name"}},
  {$project:{_id:-1, alliance: 1 , airline: 1,base:1  } },
  {$graphLookup:{ from: "air_routes",
                  startWith: "$base",
                  connectFromField: 'dst_airport',
                  connectToField: 'src_airport'

    }
  
  }
]).pretty()




db.air_alliances.aggregate([
  {
    $match: { name: "OneWorld" }
  },
  {
    $graphLookup: {
      startWith: "$airlines",
      from: "air_airlines",
      connectFromField: "name",
      connectToField: "name",
      as: "airlines",
      maxDepth: 0,
      restrictSearchWithMatch: {
        country: { $in: ["Germany", "Spain", "Canada"] }
      }
    }
  },
  {
    $graphLookup: {
      startWith: "$airlines.base",
      from: "air_routes",
      connectFromField: "dst_airport",
      connectToField: "src_airport",
      as: "connections",
      maxDepth: 1
    }
  },
  {
    $project: {
      validAirlines: "$airlines.name",
      "connections.dst_airport": 1,
      "connections.airline.name": 1
    }
  },
  { $unwind: "$connections" },
  {
    $project: {
      isValid: {
        $in: ["$connections.airline.name", "$validAirlines"]
      },
      "connections.dst_airport": 1
    }
  },
  { $match: { isValid: true } },
  {
    $group: {
      _id: "$connections.dst_airport"
    }
  }
])

db.companies.aggregate([ 
  { $match: { '$text': { '$search': 'network' } } },
  { $sortByCount:  '$category_code' }
  
  ]). pretty()

  db.companies.aggregate([
   {$match: {"$text":{"$search": "network"}   }},
   {$unwind: "$offices"},
   {$match: {"offices.city": {$ne: ''} }},
   {$sortByCount: "$offices.city"}

  ])

  
db.companies.aggregate([
 {$match: { founded_year: {$gt: 1980}}},
 {$bucket: { groupBy: "$number_of_employees", boundaries: [0,20,50,100,500,1000, Infinity], default:"Other" }}
 ]).pretty()

 db.companies.aggregate([
 {$match: {founded_year: {$gt: 1980} }},
 {$bucket: {groupBy: "$number_of_employees", 
            boundaries: [0, 20, 50, 100, 500, 1000, Infinity], 
            default: "Other",
            output:{
                "total": {$sum:1},
                "average": {$avg: "$number_of_employee"},
                "categories": {$addToSet: "$category_code" }
                   }  
            }
 }
 ])

 db.companies.aggregate([
   {$match:{"offices.city":"New York"} },
   {$bucketAuto: {groupBy: "$founded_year", 
                  buckets: 5, 
                  output:{"total":{$sum:1}, 
                          "categories":{$addToSet:"$category_code" }  
                        } 
                  }
    }
 ]).pretty()

 db.companies.aggregate([
    {$match: {"$text":{"$search":"Database" } }},
    {
        "$facet": {
            "Categories": [{$sortByCount: "$category_code" }],
            "Employee": [{$match: {founded_year: {$gt:1980}}}, 
                         {$bucket:{groupBy:"$number_of_employees", boundaries: [0,20, 50, 100,500,1000, Infinity], default: "Other" } }
                         
                        ],
            "Founded":[
                {$match: {"offices.city": "New York"}},
                {$bucketAuto:{groupBy: "$founded_year", buckets: 5} }
            ] 
        }
    }

 ]).pretty()

db.movies.aggregate([
    {$match:{metacritic: {$gte:0}, "imdb.rating" :{$gte: 0}  } },
    {$project: {_id:0, metacritic:1, imdb:1, title:1}},
    {$facet:{
        top_metacritic:[
            {$sort:{metacritic:-1, title: 1 } },
            {$limit: 10},
            {$project: {title:1} }
        ],
        top_imdb:[
            {$sort:{"imdb.rating":-1, title: 1} },
            {$limit: 10},
            {$project:{title:1} }
        ]
    } },
    {$project:{
        movies_in_both:{
            $setIntersection:["$top_metacritic","$top_imdb"]
        } 
    } }

]).pretty()

var userAccess = "Management"
db.employees.aggregate([
    {
        $redact:{$cond:[{$in:[userAccess, "$acl"]},"$$DESCEND", "$$PRUNE"]    } 
    }
]).pretty()

db.movies.aggregate(
    [
    {$unwind: "$directors" },
    {$group: {_id: "$directors", movies: {$push: "$title"}}},
    {$out: "directors_movies"}
    ]
).pretty()

/*
The following choices are incorrect:

Using $out within many sub-piplines of a $facet stage is a quick way to generate many differently shaped collections.
$out must be the last stage in a pipeline, and is not allowed within a $facet stage.

$out removes all indexes when it overwrites a collection.
This is incorrect. All indexes on an existing collection are rebuilt when $out overwrites the collection, so must be honored.

If a pipeline with $out errors, you must delete the collection specified to the $out stage.
This is incorrect. $out will not create a new collection or overwrite an existing collection if the pipeline errors.
*/

db.air_routes.aggregate([
    {$match: {src_airport:{$in:["JFK","LHR"]}, dst_airport:{$in:["JFK","LHR"]} }},
    {$lookup:{
        from: "air_alliances",
        localField: "airline.name",
        foreignField: "airlines",
        as: "alliance"
    } },
    {$unwind: "$alliance"},
    {$addFields: {"alliance":"$alliance.name" }},
    {$group:{ _id:"$alliance", carriers:{$addToSet: "$airline.name" }   } }

])

/*
mongoimport --port 27000 --authenticationDatabase admin -u m103-application-user -p m103-application-pass --file /dataset/products.json --db applicationData --collection products
*/

db.people.aggregate([
{ 
    $match: { $or: [ { status: { $eq: "A" } }, { age: { $eq: 50 } } ] } 
} 
])

db.movies.aggregate([
{$match: {year:{$gte:1980, $lt:1990}   } },
{
  $lookup:{
    from: "comments",
    let:{id:"$_id"},
    pipeline:[
      {$match: {$expr:{$eq: ["$movie_id", "$$id"]} }}
    ],
  }
}

])


db.movies.aggregate([{
  $match: {
  year: {
   $gte: 1980,
   $lt: 1990
  }
 }}, {$lookup: {
  from: 'comments',
  'let': {
   id: '$_id'
  },
  pipeline: [
   {
    $match: {
     $expr: {
      $eq: [
       '$movie_id',
       '$$id'
      ]
     }
    }
   }
  ],
  as: 'movie_comments'
 }}, {$addFields: {
  size: {
   $size: '$movie_comments'
  }
 }}, {$match: {
  size: {
   $gte: 2
  }
 }}])

 db.movies.aggregate([
  {$match: {
  year: {
   $gte: 1980,
   $lt: 1990
  }
 }}, {$lookup: {
  from: 'comments',
  localField: '_id',
  foreignField: 'movie_id',
  as: 'movie_comments'
 }}, {$addFields: {
  size: {
   $size: '$movie_comments'
  }
 }}, {$match: {
  size: {
   $gte: 2
  }
 }}])

db.movies.aggregate([
{$lookup:  {
  from: 'comments',
  let: {id: '$_id'},
  pipeline:[{
    $match:{
      $expr:{$eq:['$movie_id','$$id']}
    }
  },
  {$sort: {date:-1}}
  ],
  as: 'comments'
}
}
])





db.members.insertMany( [
  { "_id" : 1, "member" : "abc123", "status" : "A", "points" : 2, "misc1" : "note to self: confirm status", "misc2" : "Need to activate", "lastUpdate" : ISODate("2019-01-01T00:00:00Z") },
  { "_id" : 2, "member" : "xyz123", "status" : "A", "points" : 60, "misc1" : "reminder: ping me at 100pts", "misc2" : "Some random comment", "lastUpdate" : ISODate("2019-01-01T00:00:00Z") }
] )

db.members.updateMany(
  {},
  [
    {$set:{status:"Modified", comments:["$msic1", "$misc2"], lastUpdate:"$$NOW"   } },
    {$unset:["misc1", "misc2"] }
  ]
)

db.students3.insertMany(
  [

   { "_id" : 1, "tests" : [ 95, 92, 90 ], "lastUpdate" : ISODate("2019-01-01T00:00:00Z") },
   { "_id" : 2, "tests" : [ 94, 88, 90 ], "lastUpdate" : ISODate("2019-01-01T00:00:00Z") },
   { "_id" : 3, "tests" : [ 70, 75, 82 ], "lastUpdate" : ISODate("2019-01-01T00:00:00Z") }

  ]
)

db.students3.updateMany(
  {},
  [
    {$set:{
      average:  {$trunc:[{$avg: "$tests"},0] }, lastUpdate: "$$NOW"  
    }},
    {$set:{
      grade:{
        $switch:{
          branches:[
           {case:{$gte:["$average", 90]}, then: "A" },
           {case: {$gte:["$average", 80]}, then: "B"},
           {case: {$gte:["$average", 70]}, then: "C"},
           {case: {$gte:["$average", 60]}, then: "D"}
          ],
          default: "F"
        }
      }
    } }
  ]
)

db.inspectors.insertMany(
  [
{ "_id" : 92412, "inspector" : "F. Drebin", "Sector" : 1, "Patrolling" : true },
{ "_id" : 92413, "inspector" : "J. Clouseau", "Sector" : 2, "Patrolling" : false },
{ "_id" : 92414, "inspector" : "J. Clouseau", "Sector" : 3, "Patrolling" : true },
{ "_id" : 92415, "inspector" : "R. Coltrane", "Sector" : 3, "Patrolling" : false }
  ]
)
db.inspectors.updateMany(
  {"Sector": {$gt:4}, "inspector": "R. Coltrane"},
  {$set: {"Patrolling": false}},
  {upsert:true}
)


db.rastaurants.updateMany(
  {"name": "Pizza Rat's Pizzaria"},
  {$inc: {"violations":3}, $set:{"Closed": true} },
  {w: "majority", wtimeout:100}
)

db.students.insertMany( [
  { "_id" : 1, "grades" : [ 95, 92, 90 ] },
  { "_id" : 2, "grades" : [ 98, 100, 102 ] },
  { "_id" : 3, "grades" : [ 95, 110, 100 ] }
] )

db.students.updateMany(
  {grades: {$gte:100}},
  {$set: {"grades.$[element]":100}},
  {arrayFilters:[{"element":{$gte:100}}] }
)

db.students2.insertMany( [
  {
     "_id" : 1,
     "grades" : [
        { "grade" : 80, "mean" : 75, "std" : 6 },
        { "grade" : 85, "mean" : 90, "std" : 4 },
        { "grade" : 85, "mean" : 85, "std" : 6 }
     ]
  },
  {
     "_id" : 2,
     "grades" : [
        { "grade" : 90, "mean" : 75, "std" : 6 },
        { "grade" : 87, "mean" : 90, "std" : 3 },
        { "grade" : 85, "mean" : 85, "std" : 4 }
     ]
  }
] )  

db.student2.updateMany(
  {},
  {$set:{"grade.$[elem].mean": 100}  },
  {arrayFilters:[{"elem.grade":{$gte: 85}}]}
)

var item = xxx;
db.users.updateOne(
  {username: state["current_user"]},
  {$push: {"groups.$[elem].items":item}},
  {arrayFilters:[{"elem.groupname":"stuff"}]}
)

db.members.insertMany( [
  { "_id" : 1, "member" : "abc123", "status" : "P", "points" :  0,  "misc1" : null, "misc2" : null },
  { "_id" : 2, "member" : "xyz123", "status" : "A", "points" : 60,  "misc1" : "reminder: ping me at 100pts", "misc2" : "Some random comment" },
  { "_id" : 3, "member" : "lmn123", "status" : "P", "points" :  0,  "misc1" : null, "misc2" : null },
  { "_id" : 4, "member" : "pqr123", "status" : "D", "points" : 20,  "misc1" : "Deactivated", "misc2" : null },
  { "_id" : 5, "member" : "ijk123", "status" : "P", "points" :  0,  "misc1" : null, "misc2" : null },
  { "_id" : 6, "member" : "cde123", "status" : "A", "points" : 86,  "misc1" : "reminder: ping me at 100pts", "misc2" : "Some random comment" }
] )


db.members.updateMany(
  {points: {$lte:20}, status: "P"},
  {$set: {misc1: "Need to activate"}},
  {hint: {status:1}}
)


/** 

Behavior

Starting in MongoDB 5.0, update operators process document fields with string-based names in lexicographic order. 
Fields with numeric names are processed in numeric order. 
See Update Operators Behavior for details.
$addToSet only ensures that there are no duplicate items added to the set and does not affect existing duplicate elements. 
$addToSet does not guarantee a particular ordering of elements in the modified set.
Starting in MongoDB 5.0, mongod no longer raises an error when you use an update operator like $addToSet with an empty operand expression ( { } ). 
An empty update results in no changes and no oplog entry is created (meaning that the operation is a no-op).

Missing Field
If you use $addToSet on a field that is absent from the document to update, $addToSet creates the array field with the specified value as its element.

Field is Not an Array
If you use $addToSet on a field that is not an array, the operation will fail.

*/

db.alphabet.insertOne({_id:1, letters:['a','b'] })

db.alphabet.updateOne(
  {_id:1},
  {$addToSet:{letters: 'c'} }
)

db.inventory.insertOne(
  {
    _id:1, item: "polarizing_filter", tags:["electronics", "camera"]
  }
)

db.inventory.updateMany(
  {_id:1},
  {$addToSet:{tags: "accessories"} }
)

// The following $addToSet has no effect because the "camera" is already an element of the tags array:

db.inventory.updateOne(
  {_id:1},
  {$addToSet: {tags: "camera"}}
)


// $each modifier

db.inventory.insertOne(
  {_id:2, item:"cable", tags:["electronics", "supplies"]  }
)

db.inventory.UpdateOne(
  {_id:2},
  {$addToSet:{tags:{$each: ["camera","accessories", "electronics"]} }  }   //The operation only adds "camera" and "accessories" to the tags array. "electronics" was already in the array
)

db.bios.findOne(
  {
    $or:[{'name.first': /^G/},{birth: {$lt: new Date('01/01/1945')}}   ]
  }
)

db.bios.findOne(
{},
{name:1, contribs:1}
)

db.inventory.insertOne(
  { item: "socks", qty: 100, details: { colors: [ "blue", "red" ], sizes: [ "S", "M", "L"] } }
)

db.inventory.find(
  {},
  {qty:1,"details.colors":{$slice:1}}    // only return the first element of the color array
)


db.posts.insertMany([
  {
    _id: 1,
    title: "Bagels are not croissants.",
    comments: [ { comment: "0. true" }, { comment: "1. croissants aren't bagels."} ]
  },
  {
    _id: 2,
    title: "Coffee please.",
    comments: [ { comment: "0. fooey" }, { comment: "1. tea please" }, { comment: "2. iced coffee" }, { comment: "3. cappuccino" }, { comment: "4. whatever" } ]
  }
])

db.posts.find(
  {},
  {_id:0, title:1, comments:{$slice:3} }
)


db.post.find(
{},
{_id:0, title:1, comments:{$slice:-3}}

)

db.post.find(
  {},
  {_id:0,title:1, comments:{$slice:[1,3]}} // return an array with 3 elements after skipping the first element
)

db.post.find(
  {},
  {_id:0, title:1, comments:[-1,3] }   //Return an Array with 3 Elements After Skipping the Last Element
)

db.players.insertOne( {
  name: "player1",
  games: [ { game: "abc", score: 8 }, { game: "xyz", score: 5 } ],
  joined: new Date("2020-01-01"),
  lastLogin: new Date("2020-05-01")
} )

db.runCommand(
  { "createIndexes": "members"},
  { "indexes": [
    {
      "key": { "member": 1 },
       "name": "member_idx" 
    }
    ]
  }
)


db.runCommand(
  { "createIndexes": "movies",
    "indexes": [
    {
      "key": { "title": 1 },
       "name": "title_index" 
    }
    ]
  }
)

db.grantRolesToUser("dba", [{db:"playground", role: "dbOwner"}])

db.articles.insertMany([
  { "_id" : 1, "title" : "cakes and ale" },
  { "_id" : 2, "title" : "more cakes" },
  { "_id" : 3, "title" : "bread" },
  { "_id" : 4, "title" : "some cakes" },
  { "_id" : 5, "title" : "two cakes to go" },
  { "_id" : 6, "title" : "pie" }
])

db.articles.createIndex(
  {"title":"text"}
)

db.articles.find(
  {$text:{$search:"cake" } },
  {score: {$meta:"textScore"}}
)

db.articles.aggregate([
  {$match:{$text: {$search:"cake"}} },
  {$project: {score:{$meta: "textScore"} }}
])
//