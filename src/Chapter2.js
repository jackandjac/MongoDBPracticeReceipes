
// create a collection
db.createCollection("person")

//create a capped collection
db.createCollection("student",{capped:true, size:1000, max:3} )

db.student.isCapped()

//insert document

//step 1, insert a single document

db.person.insertOne({
    _id: 1001, name: "Bruce Lee", age: 10
})

// insert multiple documents 
db.person.insertMany([
{
    _id: 1003, name:"Jimmy Green", age: 28
},
{
    _id:1004, name: "Anba V M", age:16
},
{
    _id:1005, name: "Shobana", age: 44
}
])
// specify or condition in the query
db.person.find({
    $or:[{name:"Shobana"},{age: {$eq:20}}]
})

// updateOne, it will update the first document it find that meet the filter.
db.students.updateOne(
    {name: "John"},{$set:{"marks.english": 20} }
)

//update multiple documents
db.students.update({"result": "fail"},{$set:{ "marks.english": 20, "marks.math":20} })


// replaceOne
db.students.replaceOne({"name":"John"}, {_id:1001, name:"John", mark:{english:36, math: 39}, results: "passed" })

//Delete Operations
db.students.deleteOne({name:"John"})


db.students.deleteMany({name: "John" })
db.students.deleteMany({})

// $push operator
db.students.insertOne({
    _id:1, scores: [44,78, 38, 80]
})
//append one value to an array
db.students.updateOne(
    {_id:1},
    {$push:{scores:80} }
)
// append multiple values to an array
db.students.updateOne(
    {name:"joe"},
    {$push:{scores: {$each: [90, 92, 85]}  } }
)
// user $push operator with Multiple Modifiers

db.students.updateOne(
    {_id: 5},
    {
        $push:{
            quizzes:{
                $each: [{wk:5, score:8}, {wk:6, score:7}, {wk:7, score:6}],
                $sort: {score:-1},
                $slice: 3
            }
        }
    }
)

db.pigments.insertOne({_id:1, colors:["blue", "green", "red"]})
db.pigments.updateOne(
    {_id:1},
    {$addToSet: {colors: "mauve" }}
)


db.alphabet.insertOne(
    {_id: 1, letters: ["a","b"]}
)

db.alphabet.updateOne(
    {_id: 1},
    {$addToSet: {letters: {$each: ["b","c", "d"]} }}
)
// $pop operator
/**
 * The $pop operator removes the first or last element of an array. 
 * Pass $pop a value of -1 to remove the first element of an array and 1 to remove the last element in an array.
 * The $pop operator has the form:   
 * 
 */

db.students.insertOne(
    {_id:1, scores:[8,9,10]}
)

db.students.updateOne(
    {_id:1},
    {$pop:{scores:-1} }
)

//he first element, 8, has been removed from the scores array:
//
//{ _id: 1, scores: [ 9, 10 ] }

db.students.insertOne(
    {_id:10, scores:[9,10,11]}
)

db.students.updateOne(
    {_id:10},
    {$pop: {scores:1}}
)

// The last element, 11, has been removed from the scores array:

// { _id: 10, scores: [ 9,10 ] }


// Query for a document nested in an array

db.studentmarks.insertMany([
    {name: "John", marks:[{class: "II", total: 489},{class: "III", total: 490}] },
    {name: "James", marks: [{class:"III", total:469 }, {class: "IV", total: 450}] },
    {name: "Jack", marks: [{class:"II", total: 489}, {class:"III", total:390 }]},
    {name: "Smith", marks: [{class:"III", total: 489}, {class:"IV", total:490 }]},
    {name: "Joshi", marks: [{class:"II", total: 465}, {class:"III", total:470 }]}
])

db.studentmarks.find({"mark": {class:"II", total: 489} })

db.foo.update(
    {a:5, b:{$lte:7} },
    {$set: {c:8, }},
    {upsert:true}
)

// The $position modifier specifies the location in the array at which the $push operator inserts elements. Without the $position modifier, 
// the $push operator inserts elements to the end of the array. See $push modifiers for more information.

db.students.insertOne({_id:1, scores:[100]})

db.students.updateOne(
    {_id:1},
    {
        $push:{scores:{ $each:[50,60,70], $position: 0   }  }
    }
)

// The operation results in the following updated document:
// { "_id" : 1, "scores" : [  50,  60,  70,  100 ] }


db.students.insertOne( { "_id" : 2, "scores" : [  50,  60,  70,  100 ] } )

db.students.updateOne(
    {_id:2},
    {
        $push:{
            scores:{$each:[20,30], $position: 2}
        }
    }
)

// The operation results in the following updated document:
// { "_id" : 2, "scores" : [  50,  60,  20,  30,  70,  100 ] }


// $rename operator

db.students.insertMany( [
    {
      "_id": 1,
      "alias": [ "The American Cincinnatus", "The American Fabius" ],
      "mobile": "555-555-5555",
      "nmae": { "first" : "george", "last" : "washington" }
    },
    {
      "_id": 2,
      "alias": [ "My dearest friend" ],
      "mobile": "222-222-2222",
      "nmae": { "first" : "abigail", "last" : "adams" }
    },
    {
      "_id": 3,
      "alias": [ "Amazing grace" ],
      "mobile": "111-111-1111",
      "nmae": { "first" : "grace", "last" : "hopper" }
    }
 ] )

 db.students.updateMany(
     {},
     {$rename:{"nmae": "name"}}
 )

 db.students.updateMany(
     {},
     {$rename:{"name.first": "name.FirstName", "name.last":"name.LastName"}}
 )

 // $pull operator
// The $pull operator removes from an existing array all instances of a value or values that match a specified condition.

// The $pull operator has the form:

// { $pull: { <field1>: <value|condition>, <field2>: <value|condition>, ... } }

db.stores.insertMany( [
    {
       _id: 1,
       fruits: [ "apples", "pears", "oranges", "grapes", "bananas" ],
       vegetables: [ "carrots", "celery", "squash", "carrots" ]
    },
    {
       _id: 2,
       fruits: [ "plums", "kiwis", "oranges", "bananas", "apples" ],
       vegetables: [ "broccoli", "zucchini", "carrots", "onions" ]
    }
 ] )
 db.stores.updateMany(
     {},
     {$pull: {fruits:{$in:["apples","oranges"] }, vegetable: "carrots" }}
 )

 //after the above update operation  the results becomes 
 /*
 {
    _id: 1,
    fruits: [ 'pears', 'grapes', 'bananas' ],
    vegetables: [ 'celery', 'squash' ]
  },
  {
    _id: 2,
    fruits: [ 'plums', 'kiwis', 'bananas' ],
    vegetables: [ 'broccoli', 'zucchini', 'onions' ]
  }
  */

db.profiles.insertOne( { _id: 1, votes: [ 3, 5, 6, 7, 7, 8 ] } )

db.profiles.updateOne(
    {_id:1},
    {$pull: {votes:{$gte:6} }}
)

// After the update operation, the document only has values less than 6:

// { _id: 1, votes: [  3,  5 ] }

