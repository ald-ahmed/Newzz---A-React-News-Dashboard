var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');


function checkLength(text){
    return text.trim().length == 0
}

function getGArticle(element){

    let imgUrl = "https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png";

    try {
        let assets = element.blocks.main.elements[0].assets;
        imgUrl = assets[assets.length -1].file;
    }
    catch (er){
        // console.log("no image here")
    }


    if (checkLength(element.webTitle) || checkLength(element.sectionId) || checkLength(element.webPublicationDate)){
        return null
    }

    return {
        id: element.id,
        url: element.webUrl,
        webTitle: element.webTitle,
        image: imgUrl,
        sectionName: element.sectionId,
        webPublicationDate: element.webPublicationDate,
        type: "g"
    };

}
function getNYTArticle(element){

    let asset = "https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg";

    try {

        element.multimedia.forEach(imgEntry => {
            if (imgEntry.width >= 2000) {
                asset = "https://static01.nyt.com/"+imgEntry.url;
                return
            }
        });

    }
    catch (er){
        console.log("error: " + er)
    }

    return {
        webTitle: element.headline.main,
        url: element.web_url,
        image: asset,
        sectionName: element.news_desk,
        webPublicationDate: element.pub_date,
        id: element.web_url,
        type: "nyt"
    };
}


var guardianURL = "";
var nytURL = "";

function loadNYT(query, articles){

    fetch(nytURL)

        .then(res => res.json())

        .then(json => {

            json.response.docs.forEach(element => {

                // if (articles.length >= 10) {
                //     return
                // }

                let article = getNYTArticle(element);

                if (article == null) {
                    return
                }

                articles.push(article);

            });

            return (articles);

        });

}

function loadG(query){

    const articles = [];

    fetch(guardianURL)
        .then(res => res.json())

        .then(json => {

            json.response.results.forEach(element => {

                // if (articles.length >= 10) {
                //     return
                // }

                let article = getGArticle(element);

                if (article == null){
                    return
                }

                articles.push(article);


            });


            return loadNYT(query, articles)

        });

}





router.get('/', function(req, res, next) {


    let query = req.query.q;
    guardianURL = "https://content.guardianapis.com/search?q="+query+"&api-key=ff0b664a-7894-4e8c-9b2b-0084a22b3a9f&show-blocks=all";
    nytURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json?q="+query+"&api-key=oLpvpEgL2q44t6ur2uEb54CAKNSOka21"

    console.log(guardianURL);
    console.log(nytURL);

    const articles = [];

    fetch(guardianURL)
        .then(res => res.json())

        .then(json => {

            json.response.results.forEach(element => {

                // if (articles.length >= 10) {
                //     return
                // }

                let article = getGArticle(element);

                if (article == null){
                    return
                }

                articles.push(article);


            });


            fetch(nytURL)

                .then(res => res.json())

                .then(json => {

                    json.response.docs.forEach(element => {

                        let article = getNYTArticle(element);

                        if (article == null) {
                            return
                        }

                        articles.push(article);

                    });

                    res.send(articles);

            });


        });

});


module.exports = router;
