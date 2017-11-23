const request = require('request');
const scrapeIt = require('scrape-it');
const jsonfile = require('jsonfile');

var file = 'gitbook.json'

var options = {
    url: 'http://www.imdb.com/search/title?count=100&groups=top_1000&sort=alpha,asc',
};

var data = {
    articles: {
        listItem: ".lister-item",
        data: {
            url: {
                selector: ".lister-item-content h3 a",
                attr: "href",
                convert: function (x) {
                    return 'http://www.imdb.com/' + x;
                }
            },
            title: ".lister-item-content h3 a",
            year: {
                selector: '.lister-item-content h3 .lister-item-year',
                convert: function (x) {
                    var re = /(\d+)/;

                    if (re.test(x)) {
                        var found = x.match(re);
                        return parseInt(found[0]);
                    }
                }
            },
            duration: {
                selector: "p .runtime",
                convert: function (x) {
                    var re = parseInt(x);
                    return re;
                }
            },
            rating: {
                selector: ".ratings-bar .ratings-imdb-rating",
                convert: function (x) {
                    var re = parseFloat(x);
                    return re;
                }
            },
            votes: {
                selector: ".lister-item-content .sort-num_votes-visible span:nth-child(2)",
                attr: "data-value",
                convert: function (x) {
                    return parseInt(x);
                }
            },
            gross: {
                selector: ".lister-item-content .sort-num_votes-visible span:nth-child(5)",
                attr: "data-value",
                convert: function(x){
                    if (x){
                        var re = x.replace(/\,/g, '');
                        return parseInt(re);
                    }
                }
            },
            genre: {
                selector: ".lister-item-content .text-muted .genre",
                convert: function (x) {
                    return x.split(', ');
                }
            }
        }
    }
}


function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        page = scrapeIt.scrapeHTML(body, data);
        all_films.films = all_films.films.concat(page.articles);
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////
//   SCRAPING ALL PAGES
var all_films = {
    films: []
};

var count = 1;

function scraperloop() {
    setTimeout(function () {
        var url = "http://www.imdb.com/search/title?count=100&groups=top_1000&sort=alpha,asc&page=" + count + "&ref_=adv_nxt";
        request(url, callback);
        count += 1;
        if (count <= 10) {
            scraperloop();
        }
        else {
            jsonfile.writeFile(file, all_films, { spaces: 2 }, function (err) {
                console.error(err || 'success')
            });

        }

    }, 2000)
}

scraperloop();

