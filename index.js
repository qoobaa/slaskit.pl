const http = require("http");
const https = require("https");

function filterEventsBetweenDates(events, start, end) {
    var results = [];

    if (events.length > 0) {
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var eventDate = event.gsx$data.$t.substr(0, 10);
            var today = start.toISOString().substr(0, 10);
            var weekFromNow = end.toISOString().substr(0, 10);

            if (today < eventDate && eventDate < weekFromNow) {
                results.push(event);
            }
        }
    }

    return results;
}

function renderRSS(events) {
    var result = "";

    if (events.length > 0) {
        result += '<?xml version="1.0"?>';
        result += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
        result += '<channel>';
        result += '<atom:link href="https://script.google.com/macros/s/AKfycbz9P7i0sevvJSkHgmRW0etkG7bvmzP_vtLF5QmztpodBfT_tjzP/exec" rel="self" type="application/rss+xml" />';
        result += '<title>Śląsk IT</title>';
        result += '<link>https://script.google.com/macros/s/AKfycbz9P7i0sevvJSkHgmRW0etkG7bvmzP_vtLF5QmztpodBfT_tjzP/exec</link>';
        result += '<description>Wydarzenia IT ze Śląska i okolic w jednym miejscu, dostarczane co tydzień w formie przejrzystego newslettera.</description>';
        result += '<pubDate>' + new Date().toUTCString() + '</pubDate>';

        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var title = event.gsx$nazwa.$t;
            var link = event.gsx$linkdostrony.$t;
            var guid = event.id.$t;

            var year = parseInt(event.gsx$data.$t.substr(0, 4), 10);
            var month = parseInt(event.gsx$data.$t.substr(5, 2), 10) - 1;
            var day = parseInt(event.gsx$data.$t.substr(8, 2), 10);
            var hour = parseInt(event.gsx$data.$t.substr(11, 2), 10);
            var minute = parseInt(event.gsx$data.$t.substr(14, 2), 10);
            var second = parseInt(event.gsx$data.$t.substr(17, 2), 10);

            var date = new Date(year, month, day, hour, minute, second);

            var dayName = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"][date.getDay()];
            var monthName = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"][date.getMonth()];
            var hourMinute = event.gsx$data.$t.substr(11, 5);

            var description = "";

            description += '&lt;b&gt;';
            description += [event.gsx$nazwamiejsca.$t, event.gsx$miasto.$t, event.gsx$adres.$t].join(", ");
            description += '&lt;/b&gt;&lt;br&gt;';
            description += '&lt;i&gt;';
            description += [dayName, day + " " + monthName, "godzina " + hourMinute].join(", ");
            description += '&lt;/i&gt;&lt;br&gt;';
            description += event.gsx$opis.$t;

            result += '<item>';
            result += '<guid>' + guid + '</guid>';
            result += '<title>' + title + '</title>';
            result += '<author>none</author>';
            result += '<pubDate>' + new Date().toUTCString() + '</pubDate>';
            result += '<link>' + link + '</link>';
            result += '<description>' + description + '</description>';
            result += '</item>';
        }

        result += '</channel>';
        result += '</rss>';
    }

    return result;
}

function fetch(url, callback) {
    https.get(url, function (response) {
        var text = "";

        response.on("data", function (data) {
            text += data;
        });

        response.on("end", function () {
            callback(text);
        });
    });
}

http.createServer(function (request, response) {
    response.writeHead(200, { "Content-Type": "application/xml" });

    fetch("https://spreadsheets.google.com/feeds/list/1p1ETuEGcyLpj_kvv7LUroEgTL8ZC7h3XI9_Tx1awBaU/o65ytag/public/values?alt=json", function (text) {
        var events = JSON.parse(text).feed.entry;
        var nextWeekEvents = filterEventsBetweenDates(events, new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
        var rss = renderRSS(nextWeekEvents);

        response.end(rss);
    });
}).listen(process.env.PORT);
