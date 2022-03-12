
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