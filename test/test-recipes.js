const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server.js");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Recipes", function() {
    //starts the server with promis
    //before running the test
    before(function() {
        return runServer();
    });

    //close the server after test has run
    // manually created promise imported
    // as a module from server.js
    after(function() {
        return closeServer();
    });

    //actual test starts here

    // testing getting all recipes on get request to endpoint
    it("Should list All recipes on GET", function() {
        // async operation returning promise
        // not using done callback, since our app 
        // returns promises anyway
        return chai.request(app)
        .get("/recipes")
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a("array");
            // expecting 2 recipes 
            expect(res.body.length).to.be.at.least(3);
            res.body.forEach(function(item) {
                expect(item).to.be.a("object");
                expect(item).to.have.all.keys(
                    'id', 'name', "ingredients");
            });
        });
    });


    // testing POST request to enpoint and respose data
    it("Should add a recipe to the list of other recipes on POST", function() {
        const newRecipe = {name: 'Gourmet HotDog', ingredients: ['1 Hot dog', '1 Hotdog bun']};
        return chai.request(app)
            .post("/recipes")
            .send(newRecipe)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('id', 'name', 'ingredients');
                expect(res.body.id).to.not.equal(null);
                expect(res.body).to.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
            });
    });

    // testing PUT request to recipes endpoint
    it("Should properly update Recipe provided with appropiate fields", function() {
        const updatedRecipe = {
            name: 'Awesome Taco',
            ingredients: ['Run of the mill Taco', 'Awesome Sauce']
        };
        return chai.request(app)
            // since not using db, get an existing recipe from server
            .get('/recipes')
            .then(function(res) {
                // get id from the first listed recipe on GET
                // add it as property to updatedRecipe object
                updatedRecipe.id = res.body[0].id;
                return chai.request(app)
                .put(`/recipes/${updatedRecipe.id}`)
                .send(updatedRecipe)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                expect(res.body).to.be.a('object');
            });
    });

    // testing endpoint on DELETE
    it("Should delete a recipe provided an id on DELETE", function() {
        return chai.request(app)
        // since not db get id from get response first 
        .get('/recipes')
        .then(function(res) {
            const recipeID = res.body[0].id;
            return chai.request(app)
                .delete(`/recipes/${recipeID}`);
        })
        .then(function(res) {
            expect(res).to.have.status(204);
        });
    });

});