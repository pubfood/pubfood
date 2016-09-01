    // prepare key/value pair of user audiences.  Example result: 'ccaud=sports;ccaud=movie;ccaud=blogger'
    
    var dartCCKey = "ccaud";
    var dartCC = "";
    if (typeof(ccauds) != 'undefined')
    {
        for (var cci = 0; cci < ccauds.Profile.Audiences.Audience.length; cci++)
        {
            if (cci > 0) dartCC += ",";
            dartCC += ccauds.Profile.Audiences.Audience[cci].abbr;
        }
      }
// googletag.cmd.push(function() {
// googletag.pubads().setTargeting(dartCCKey, [dartCC]);
//   });
