var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
var tokenizer = require('sbd');



function checkLength(text){
    if (!text){
        return true
    }

    return text.trim().length == 0
}

function getArticleDetailed(element){

    let asset = "https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg";
    let entireAbstract = element.abstract;

    try {

        element.multimedia.forEach(imgEntry => {
            if (imgEntry.width >= 2000) {
                asset = "https://static01.nyt.com/"+imgEntry.url;
                return
            }
        });

        var abstractList = tokenizer.sentences(element.abstract, {});

        if (abstractList.length >= 4) {
            abstractList = abstractList.slice(0, 4);
            let abstractTemp = abstractList.join(' ');
            if (abstractList.length > 0) {
                element.abstract = abstractTemp
            }
        }

    }
    catch (er){
        console.log("error: " + er)
    }

    const article = {
        webTitle: element.headline.main,
        url: element.web_url,
        image: asset,
        webPublicationDate: element.pub_date,
        bodyTextSummary: element.abstract,
        bodyText: entireAbstract,
        id: element.web_url,
        type: "nyt"
    };

    return article

}

function getArticle(element){


    let asset = "https://upload.wikimedia.org/wikipedia/commons/0/0e/Nytimes_hq.jpg";

    try {

        element.multimedia.forEach(imgEntry => {
            if (imgEntry.width >= 2000) {
                asset = imgEntry.url;
                return
            }
        });


        if (checkLength(element.abstract)){
            return null
        }

        var abstractList = tokenizer.sentences(element.abstract, {});

        if (abstractList.length >= 4) {
            abstractList = abstractList.slice(0, 4);
            let abstractTemp = abstractList.join(' ');
            if (abstractList.length > 0) {
                element.abstract = abstractTemp
            }
        }

    }
    catch (er){
        console.log("error: " + er)
    }


    if (checkLength(element.title) || checkLength(element.section) || checkLength(element.abstract) || checkLength(element.published_date)){
        return null
    }

    let section = element.section;

    if (element.subsection === "world" ||
        element.subsection === "politics"||
        element.subsection === "business"||
        element.subsection === "technology"||
        element.subsection === "sports"
    ) {
        section = element.subsection;
    }

    const article = {
        webTitle: element.title,
        image: asset,
        sectionName: section,
        webPublicationDate: element.published_date,
        bodyTextSummary: element.abstract,
        id: element.url,
        url: element.url,
        type: "nyt"
    };

    return article
}


/* GET home page. */
router.get('/', function(req, res, next) {

    const articles = [];

    const url = "https://api.nytimes.com/svc/topstories/v2/home.json?api-key=oLpvpEgL2q44t6ur2uEb54CAKNSOka21";

    fetch(url)

        .then(res => res.json())

        .then(json => {

            json.results.forEach(element => {

                if (articles.length >= 10) {
                    return
                }

                let article = getArticle(element);

                if (article == null) {
                    return
                }

                articles.push(article);

            });

            res.send(articles);
        });

});

router.get('/section/:id', function(req, res, next) {

    const articles = [];
    let section = req.params.id;

    if (section === "sport") {
        section = "sports"
    }

    const url = "https://api.nytimes.com/svc/topstories/v2/"+section+".json?api-key=oLpvpEgL2q44t6ur2uEb54CAKNSOka21";
    console.log(url);

    fetch(url)

        .then(res => res.json())
        .then(json => {

            json.results.forEach(element => {

                if (articles.length >= 10) {
                    return
                }

                let article = getArticle(element);

                if (article == null) {
                    return
                }

                articles.push(article);

            });

            res.send(articles);
        });

});


router.get('/grab', function(req, res, next) {

    console.log("hello");

    const articles = [];

    var section = req.query.path;
    console.log(section);

    const guardianURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=web_url:(%22"+section+"%22)&api-key=oLpvpEgL2q44t6ur2uEb54CAKNSOka21";

    console.log(guardianURL);

    fetch(guardianURL)

        .then(res => res.json())
        .then(json => {

            let article = getArticleDetailed(json.response.docs[0]);

            if (article == null){
                return
            }

            articles.push(article);

            res.send(articles);
        });


});

module.exports = router;


// https://api.nytimes.com/svc/search/v2/articlesearch.json?q=[QUERY_KEYWORD]&apikey=oLpvpEgL2q44t6ur2uEb54CAKNSOka21
// https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=web_url:("[ARTICLE_WEB_URL]")&apikey=oLpvpEgL2q44t6ur2uEb54CAKNSOka21

module.exports = router;
