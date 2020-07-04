
process.env.NODE_ENV = 'test';

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require("../index.js")
let expect = chai.expect;

chai.use(chaiHttp)

//Test new_map_style.css
describe('CSS new map style', () => {
    it("Fetch the css for the site", (done)=>{
        chai.request(server)
            .get('/new_map_style.css')
            .end((err,res)=>{
                expect(res).to.have.status(200)
                done();
            })
    });

    it("Determine if css is in syntactically correct", (done)=>{
        chai.request(server)
            .get('/new_map_style.css')
            .end((err,res)=>{

                let format = false
                let css = res.text;
                
                expect(css).to.have.string(".coronavirus-map")
                expect(css).to.have.string(".left-wrapper")
                expect(css).to.have.string(".collection-item")

                done();
            })
    })
});

describe('JS regular cases', () => {
    it("Fetch the js for the site", (done)=>{
        chai.request(server)
            .get('/map_cases_script.js')
            .end((err,res)=>{
                expect(res).to.have.status(200)
                done();
            })
    });

    it("Check syntax js", (done)=>{
        chai.request(server)
            .get('/map_cases_script.js')
            .end((err,res)=>{

                let format = false;

                let buffer;
                res.on("data", function(data){
                    buffer += data
                });

                res.on("end", function(){
                    //console.log(typeof buffer)

                    expect(buffer).to.have.string("https://raw.githubusercontent.com/320834/Geojson_data/master/counties-cases.geojson")
                    expect(buffer).to.have.string("inter_values")
                    expect(buffer).to.have.string("const map = new mapboxgl.Map")
                    done();
                })

            })
    })
});

describe('JS per capita', () => {
    it("Fetch the js for the site", (done)=>{
        chai.request(server)
            .get('/map_cases_per_capita.js')
            .end((err,res)=>{
                expect(res).to.have.status(200)
                done();
            })
    });
});


describe('JS per sqm', () => {
    it("Fetch the js for the site", (done)=>{
        chai.request(server)
            .get('/map_cases_per_sqm.js')
            .end((err,res)=>{
                expect(res).to.have.status(200)
                done();
            })
    });
});

describe('JS seven day average percent change cases and death', ()=>{
    it("Fetch the js for the site", (done)=>{
        chai.request(server)
            .get('/map_seven_day_percent_change_case_death.js')
            .end((err,res)=>{
                expect(res).to.have.status(200);
                done();
            })
    })
})


describe('Test missing file', () => {
    it("Fetch missing link", (done)=>{
        chai.request(server)
            .get('/error_stuff')
            .end((err,res)=>{
                expect(res).to.have.status(404)
                done();
            })
    });
});