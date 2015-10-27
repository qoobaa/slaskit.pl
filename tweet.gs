function onSpreadsheetEdit(e){
  var range = e.range;
  var columnIndex = e.range.getColumnIndex();
  var sheet = e.range.getSheet();
  var headerRange = sheet.getRange("A1:I1");
  var columnName = headerRange.getCell(1, columnIndex).getValue();

  if (columnName === "Zatwierdzono" && e.value === "tak") {
    var rowRange = sheet.getRange(e.range.getRowIndex(), 1, 1, 9);
    var name = rowRange.getCell(1, 3).getValue();
    var link = rowRange.getCell(1, 8).getValue();

    var tweetStatus = name + " " + link;
    Logger.log("Sending tweet status: " + tweetStatus);
    tweet(tweetStatus);
  }
}

function tweet(status) {
  var twitterService = getTwitterService();
  var url = "https://api.twitter.com/1.1/statuses/update.json";
  var options = {
    method: "post",
    payload: {
      status: status
    }
  };

  var response = twitterService.fetch(url, options);

  if (response.getResponseCode() === 200) {
    Logger.log("Twitter status sent!");
  } else {
    Logger.log(response);
  }
}

function getTwitterService() {
  var TWITTER_CONSUMER_KEY = ScriptProperties.getProperty("twitterConsumerKey");
  var TWITTER_CONSUMER_SECRET = ScriptProperties.getProperty("twitterConsumerSecret");

  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth1.createService("twitter")
    // Set the endpoint URLs.
    .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
    .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
    .setAuthorizationUrl("https://api.twitter.com/oauth/authorize")

    // Set the consumer key and secret.
    .setConsumerKey(TWITTER_CONSUMER_KEY)
    .setConsumerSecret(TWITTER_CONSUMER_SECRET)

    // Set the name of the callback function in the script referenced
    // above that should be invoked to complete the OAuth flow.
    .setCallbackFunction("authCallback")

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties());
}

function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .createMenu("Twitter")
      .addItem("Authorize", "showAuthorizeDialog")
      .addToUi();
}

function showAuthorizeDialog() {
  var twitterService = getTwitterService();
  var html;

  if (!twitterService.hasAccess()) {
    var authorizationUrl = twitterService.authorize();
    var template = HtmlService.createTemplate(
        '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
        'Close this modal when the authorization is complete.');
    template.authorizationUrl = authorizationUrl;
    html = template.evaluate();
  } else {
    html = HtmlService.createHtmlOutput("Already authorized!");
  }

  SpreadsheetApp.getUi().showModalDialog(html, "Twitter authorization");
}

function authCallback(request) {
  var twitterService = getTwitterService();
  var isAuthorized = twitterService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput("Success! You can close this tab.");
  } else {
    return HtmlService.createHtmlOutput("Denied. You can close this tab");
  }
}
