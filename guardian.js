var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
var tokenizer = require('sbd');



function checkLength(text){
    return text.trim().length == 0
}


function getArticle(element){

    let imgUrl = "https://assets.guim.co.uk/images/eada8aa27c12fe2d5afa3a89d3fbae0d/fallback-logo.png";

    try {
        let assets = element.blocks.main.elements[0].assets;
        imgUrl = assets[assets.length -1].file;
    }
    catch (er){
        // console.log("no image here")
    }

    let bodyText = "";
    let abstract = "";
    let abstractList = [];

    try {

        abstract = element.blocks.body[0].bodyTextSummary;
        bodyText = element.blocks.body[0].bodyTextSummary;
        abstractList = tokenizer.sentences(abstract, {}).slice(0, 4);

        if (abstractList.length > 0){
            abstract = abstractList.join(' ')
        }

    }
    catch (er){
        return null
    }


    if (checkLength(element.webTitle) || checkLength(element.sectionId) || checkLength(abstract) || checkLength(element.webPublicationDate)){
        return null
    }

    const article = {
        id: element.id,
        url: element.webUrl,
        webTitle: element.webTitle,
        image: imgUrl,
        sectionName: element.sectionId,
        webPublicationDate: element.webPublicationDate,
        bodyTextSummary: abstract,
        bodyText: bodyText,
        type: "g"
    };

    return article

}

router.get('/', function(req, res, next) {

  const articles = [];

  const guardianURL = "https://content.guardianapis.com/search?api-key=ff0b664a-7894-4e8c-9b2b-0084a22b3a9f&section=(sport|business|technology|politics)&show-blocks=all";

  fetch(guardianURL)
      .then(res => res.json())

      .then(json => {

          json.response.results.forEach(element => {

              if (articles.length >= 10) {
                  return
              }

              let article = getArticle(element);

              if (article == null){
                    return
              }

              articles.push(article);

          });

          res.send(articles);
      });

});

router.get('/section/:id', function(req, res, next) {

    const articles = [];

    var section = req.params.id;
    console.log(section);

    const guardianURL = "https://content.guardianapis.com/"+section+"?api-key=ff0b664a-7894-4e8c-9b2b-0084a22b3a9f&show-blocks=all";
    console.log(guardianURL);

    fetch(guardianURL)
        .then(res => res.json())

        .then(json => {

            json.response.results.forEach(element => {

                if (articles.length >= 10) {
                    return
                }

                let article = getArticle(element);

                if (article == null){
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

    const guardianURL = "https://content.guardianapis.com/"+section+"?api-key=ff0b664a-7894-4e8c-9b2b-0084a22b3a9f&show-blocks=all";
    console.log(guardianURL);

    fetch(guardianURL)

        .then(res => res.json())
        .then(json => {

                let article = getArticle(json.response.content);

                if (article == null){
                    return
                }

                articles.push(article);

                res.send(articles);
        });

});


module.exports = router;
