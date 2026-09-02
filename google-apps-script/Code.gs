/**
 * Portfolio contact form -> Gmail (+ optional Google Sheet log)
 * ---------------------------------------------------------------
 * Free, no third party, runs on your own Google account.
 *
 * SETUP
 *  1. Go to https://script.google.com  ->  New project
 *  2. Delete the sample code, paste this whole file in, and Save.
 *  3. Set RECIPIENT below to the address you want messages at.
 *  4. Deploy -> New deployment -> type "Web app"
 *       Execute as:        Me
 *       Who has access:    Anyone            <-- must be "Anyone", not "Anyone with Google account"
 *  5. Authorise when prompted (it will warn the app is unverified -
 *     that is normal for your own script: Advanced -> Go to project).
 *  6. Copy the /exec URL it gives you into js/config.js as formEndpoint.
 *
 * Gmail sending quota on a free account is 100 emails/day. Plenty.
 */

var RECIPIENT = "fchaudhary043@gmail.com";

// Optional: paste a Google Sheet ID here to also log every message.
// Leave "" to only send email.
var SHEET_ID = "";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply(false, "Empty request");
    }

    var d = JSON.parse(e.postData.contents);

    // Honeypot: only a bot fills a field it cannot see.
    // Answer success so the bot learns nothing.
    if (d.botcheck) return reply(true, "Thanks");

    var name    = String(d.name    || "").trim().slice(0, 120);
    var email   = String(d.email   || "").trim().slice(0, 200);
    var message = String(d.message || "").trim().slice(0, 5000);

    if (!name || !message) return reply(false, "Name and message are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(false, "Invalid email");

    MailApp.sendEmail({
      to:      RECIPIENT,
      replyTo: email,
      subject: "Portfolio enquiry from " + name,
      body:    message + "\n\n---\nFrom: " + name + " <" + email + ">\nSent from your portfolio site."
    });

    if (SHEET_ID) {
      SpreadsheetApp.openById(SHEET_ID)
        .getSheets()[0]
        .appendRow([new Date(), name, email, message]);
    }

    return reply(true, "Sent");

  } catch (err) {
    return reply(false, String(err));
  }
}

// A GET is handy for checking the deployment is live in a browser tab.
function doGet() {
  return reply(true, "Contact endpoint is running");
}

function reply(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
