"use strict";
/*global require,process*/

const http = require("http");
const https = require("https");
const port = process.env.PORT || 4200;

function filterEventsBetweenDates(events, start, end) {
    let results = [];

    if (events.length > 0) {
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let eventDate = event.gsx$data.$t.substr(0, 10);
            let today = start.toISOString().substr(0, 10);
            let weekFromNow = end.toISOString().substr(0, 10);

            if (today < eventDate && eventDate < weekFromNow) {
                results.push(event);
            }
        }
    }

    return results;
}

function renderRSS(events) {
    let now = new Date().toUTCString();
    let result = "";

    if (events.length > 0) {
        result += '<?xml version="1.0"?>';
        result += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
        result += '<channel>';
        result += '<atom:link href="https://slaskit-rss.herokuapp.com/" rel="self" type="application/rss+xml" />';
        result += '<title>Śląsk IT</title>';
        result += '<link>https://script.google.com/macros/s/AKfycbz9P7i0sevvJSkHgmRW0etkG7bvmzP_vtLF5QmztpodBfT_tjzP/exec</link>';
        result += '<description>Wydarzenia IT ze Śląska i okolic w jednym miejscu, dostarczane co tydzień w formie przejrzystego newslettera.</description>';
        result += `<pubDate>${now}</pubDate>`;

        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let title = event.gsx$nazwa.$t;
            let link = event.gsx$linkdostrony.$t;
            let guid = event.id.$t;

            let year = parseInt(event.gsx$data.$t.substr(0, 4), 10);
            let month = parseInt(event.gsx$data.$t.substr(5, 2), 10) - 1;
            let day = parseInt(event.gsx$data.$t.substr(8, 2), 10);
            let hour = parseInt(event.gsx$data.$t.substr(11, 2), 10);
            let minute = parseInt(event.gsx$data.$t.substr(14, 2), 10);
            let second = parseInt(event.gsx$data.$t.substr(17, 2), 10);

            let date = new Date(year, month, day, hour, minute, second);

            let dayName = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"][date.getDay()];
            let monthName = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"][date.getMonth()];
            let hourMinute = event.gsx$data.$t.substr(11, 5);

            let description = "";

            description += '&lt;b&gt;';
            description += [event.gsx$nazwamiejsca.$t, event.gsx$miasto.$t, event.gsx$adres.$t].join(", ");
            description += '&lt;/b&gt;&lt;br&gt;';
            description += '&lt;i&gt;';
            description += [dayName, `${day} ${monthName}`, `godzina ${hourMinute}`].join(", ");
            description += '&lt;/i&gt;&lt;br&gt;';
            description += event.gsx$opis.$t;

            result += '<item>';
            result += `<guid>${guid}</guid>`;
            result += `<title>${title}</title>`;
            result += '<author>kontakt@slaskit.pl (Śląsk IT)</author>';
            result += `<pubDate>${now}</pubDate>`;
            result += `<link>${link}</link>`;
            result += `<description>${description}</description>`;
            result += '</item>';
        }

        result += '</channel>';
        result += '</rss>';
    }

    return result;
}

function fetch(url, callback) {
    https.get(url, function (response) {
        let text = "";

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
        let events = JSON.parse(text).feed.entry;
        let nextWeekEvents = filterEventsBetweenDates(events, new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
        let rss = renderRSS(nextWeekEvents);

        response.end(rss);
    });
}).listen(port);
