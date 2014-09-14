var addr = document.getElementById('address');
if (addr !== null) {
  addr.addEventListener('blur', queryCensusTract);
  var notice = document.createElement('div');
  notice.id = 'tractNotice';
  notice.setAttribute('style','margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
  addr.parentElement.appendChild(notice);
}
var city = document.getElementById('city');
if (city !== null) city.addEventListener('blur', queryCensusTract);

// COPIED FROM collegeExp.js
function fillDormExp() {
  var addr = document.getElementById('address');
  var addr2 = document.getElementById('address2');
  var zip = document.getElementById('zipcode');
  var expiry = document.getElementById('dateexpiry');
  
  if (zip !== null && addr !== null && expiry.value === '') {
    addrRegEx = /[ ]*15(10|20) tripp.*|[ ]*970 university.*|[ ]*(625|635|640|650) elm.*|[ ]*(35|420).{0,7}park.*|[ ]*1200 observatory.*|[ ]*16(35|50) kronshage.*|[ ]*(835|917|919|921).{0,6}dayton.*|[ ]*1950 willow.*|[ ]*(615|821|917).{0,6}johnson.*|[ ]*625 babcock.*/i;
    zipRegEx = /53706(\-[0-9]{4})?|53715(\-[0-9]{4})?/;
    var addressVal = addr2 !== null ? addr.value + " " + addr2.value : addr.value;
    if (zipRegEx.test(zip.value) && addrRegEx.test(addressVal)) {
      date = new Date();
      switch(parseInt(date.getUTCMonth())) {
      case 0:
      case 1:
      case 2:
     case 3:
        year = date.getUTCFullYear();
        break;
      case 4:
        if (parseInt(date.getUTCDate()) < 15) {
          year = date.getUTCFullYear();
        }
        break;
      default:
        year = (parseInt(date.getUTCFullYear())+1).toString();
        break;
      }
      expiry.value = "05/15/" + year;
    }
  }
}

function selectPSTAT(selectList, value) {
  if (selectList !== null && value !== null) {
    for (var i = 0; i < selectList.length; i++) {
      if (selectList.children[i].value === value) {
        selectList.selectedIndex = i;
        var result = document.getElementById('tractResult');
        if (result !== null) {
          result.setAttribute('style','display:inline-block;color:#00c000;');
          result.textContent = '[MATCH: '+matchAddr+']';
        }
        break;
      }
    }
  }
}

function cleanAddr(addr) {
  addrParts = addr.split(" ");
  addrTrim = '';
  for (var i = 0; i < addrParts.length; i++) {
    if (i === 0) addrTrim += encodeURIComponent(addrParts[i]);
    else addrTrim += " " + encodeURIComponent(addrParts[i]);
  }
  return addrTrim;
}

function queryCensusTract() {
  var addr = document.getElementById('address');
  var city = document.getElementById('city');
  var entryForm = document.forms.entryform;
  var selectList = (entryForm !== null) ? entryForm.elements.sort1 : null;
  var notice = document.getElementById('tractNotice');

  if (addr.value !== "" && city.value !== "" && zip !== null && selectList !== null) {
    // Generate loading message
    notice.textContent = "Searching for census tract and zipcode... ";
    var result = document.createElement('div');
    result.setAttribute('id','tractResult');
    notice.appendChild(result);
    result.textContent = '';
    setTimeout(function() {
      var tr = document.getElementById('tractResult');
      if (tr !== null && tr.textContent === '') {
        tr.setAttribute('style','display:inline-block');
        tr.textContent = '[NOTE: Server slow to respond—please enter zipcode and census tract manually]';
      }
    }, 6000);

    self.port.emit("queryCntySub", cleanAddr(addr.value));
    self.port.on("receivedCntySub", function (cntySub) {
      self.port.emit("queryTract", [cntySub,cleanAddr(addr.value)]);
    });
    self.port.on("receivedTract", function (cntySubAddrTract) {
      var cntySub = cntySubAddrTract[0];
      var addrTract = cntySubAddrTract[1];
      var results = false;
      if (addrTract !== null && addrTract.length === 3) {
        var matchAddr = addrTract[0];
        zip.value = addrTract[1];
        fillDormExp();
     
        switch (cntySub) {
	  case "Blooming Grove town":
	    selectPSTAT(selectList, "D-BG-T");
	    break;
	  case "Madison city":
	    selectPSTAT(selectList, "D-"+addrTract[2]);
	    break;
	  case "Madison town":
	    selectPSTAT(selectList, "D-MAD-T");
	    break;
	  default:
	    selectUND(selectList, "X-UND");
            result.setAttribute('style','display:inline-block');
            result.textContent = "[FAILED: unable to determine county subdivision; please enter zipcode and PSTAT manually.]";
	    break;
        }
      }
    });
  }
}
